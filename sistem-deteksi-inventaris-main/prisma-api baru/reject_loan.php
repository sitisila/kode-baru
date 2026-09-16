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

$body   = json_decode(file_get_contents("php://input"), true);
$loanId = $body['id'] ?? $_GET['id'] ?? null;

if (!$loanId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID tidak ditemukan"]);
    exit;
}

try {
    $checkLoan = $conn->prepare("SELECT status, userName, userEmail, assetName FROM loans WHERE id = ?");
    $checkLoan->execute([$loanId]);
    $loan = $checkLoan->fetch(PDO::FETCH_ASSOC);

    if (!$loan || $loan['status'] !== 'PENDING') {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Peminjaman ini sudah diproses sebelumnya."]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE loans SET status = 'REJECTED' WHERE id = ?");
    $stmt->execute([$loanId]);

    $emailSent = false;
    $emailError = null;

    try {
        require_once 'mail_helper.php';

        $userEmail = $loan['userEmail'] ?? '';
        $userName  = $loan['userName'] ?? 'Mahasiswa';
        $assetName = $loan['assetName'] ?? 'Aset';

        if (!empty($userEmail)) {
            $subject = "[PRISMA FIT] Peminjaman Ditolak";
            $contentBody = "
                <p>Halo, <b>" . htmlspecialchars($userName) . "</b>.</p>
                <p>Mohon maaf, pengajuan peminjaman Anda untuk aset <b>" . htmlspecialchars($assetName) . "</b> <b>ditolak</b> oleh admin/dosen laboratorium.</p>
                <p>Silakan hubungi pihak laboratorium untuk informasi lebih lanjut, atau ajukan kembali peminjaman jika diperlukan.</p>
                <p>Terima kasih telah menggunakan PRISMA FIT.</p>
            ";
            sendEmail($userEmail, $userName, $subject, $contentBody);
            $emailSent = true;
        }
    } catch (Throwable $mailEx) {
        $emailError = $mailEx->getMessage();
        error_log("reject_loan mail_helper error: " . $emailError);
    }

    $response = ["status" => "success", "message" => "Peminjaman ditolak"];
    if (!$emailSent && $emailError) {
        $response["email_warning"] = "Penolakan berhasil, namun email notifikasi gagal terkirim.";
    }
    echo json_encode($response);

} catch (PDOException $e) {
    error_log("reject_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memproses penolakan."]);
}

?>