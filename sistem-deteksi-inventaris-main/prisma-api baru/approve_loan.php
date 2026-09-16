<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin', 'Dosen']);

$body    = json_decode(file_get_contents("php://input"), true);
$loanId  = $body['id'] ?? $_GET['id'] ?? null;
$assetId = $body['assetId'] ?? $_GET['assetId'] ?? null;

if (!$loanId || !$assetId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

try {
    $conn->beginTransaction();

    $checkLoan = $conn->prepare("SELECT status, userName, userEmail, assetName, borrowTime, returnTime FROM loans WHERE id = ? FOR UPDATE");
    $checkLoan->execute([$loanId]);
    $loan = $checkLoan->fetch(PDO::FETCH_ASSOC);

    if (!$loan || $loan['status'] !== 'PENDING') {
        $conn->rollBack();
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Peminjaman ini sudah diproses sebelumnya."]);
        exit;
    }

    $stmt1 = $conn->prepare("UPDATE loans SET status = 'APPROVED' WHERE id = ?");
    $stmt1->execute([$loanId]);

    $stmt2 = $conn->prepare("UPDATE assets SET status = 'BORROWED' WHERE id = ?");
    $stmt2->execute([$assetId]);

    $conn->commit();


    $emailSent = false;
    $emailError = null;

    try {
        require_once 'mail_helper.php';

        $userEmail = $loan['userEmail'] ?? '';
        $userName  = $loan['userName'] ?? 'Mahasiswa';
        $assetName = $loan['assetName'] ?? 'Aset';

        if (!empty($userEmail)) {
            $subject = "[PRISMA FIT] Peminjaman Disetujui";
            $contentBody = "
                <p>Halo, <b>" . htmlspecialchars($userName) . "</b>.</p>
                <p>Kabar baik! Pengajuan peminjaman Anda telah <b>disetujui</b> oleh admin/dosen laboratorium.</p>

                <div style='background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 15px; margin-top: 15px;'>
                    <h4 style='margin: 0 0 10px 0; color: #1e1b4b;'>Detail Peminjaman</h4>
                    <ul style='margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;'>
                        <li><b>Nama Aset:</b> " . htmlspecialchars($assetName) . "</li>
                        <li><b>Waktu Pinjam:</b> " . htmlspecialchars($loan['borrowTime'] ?? '-') . " s/d " . htmlspecialchars($loan['returnTime'] ?? '-') . "</li>
                        <li><b>Status:</b> <span style='background-color: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;'>Disetujui</span></li>
                    </ul>
                </div>
                <br>
                <p>Silakan ambil aset di laboratorium sesuai jadwal yang telah ditentukan.</p>
                <p>Terima kasih telah menggunakan PRISMA FIT.</p>
            ";
            sendEmail($userEmail, $userName, $subject, $contentBody);
            $emailSent = true;
        }
    } catch (Throwable $mailEx) {
        $emailError = $mailEx->getMessage();
        error_log("approve_loan mail_helper error: " . $emailError);
    }

    $response = ["status" => "success", "message" => "Peminjaman disetujui!"];
    if (!$emailSent && $emailError) {
        $response["email_warning"] = "Persetujuan berhasil, namun email notifikasi gagal terkirim.";
    }
    echo json_encode($response);

} catch (PDOException $e) {
    $conn->rollBack();
    error_log("approve_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memproses persetujuan."]);
}
?>