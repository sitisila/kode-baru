<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';


$currentUser = requireAuth($conn);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->assetId)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID Aset wajib diisi."]);
    exit;
}

$startDate = date('Y-m-d');
$endDate = date('Y-m-d');

$borrowTime = !empty($data->borrowTime) ? $data->borrowTime : date('H:i:s');
$returnTime = !empty($data->returnTime) ? $data->returnTime : date('H:i:s', strtotime('+2 hours'));

try {
  
    $checkAsset = $conn->prepare("SELECT asset_name, description, deskripsi, status, code FROM assets WHERE id = ?");
    $checkAsset->execute([$data->assetId]);
    $asset = $checkAsset->fetch(PDO::FETCH_ASSOC);

    if (!$asset) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Aset tidak ditemukan di database."]);
        exit;
    }

    $descriptionStr = $asset['description'] ?? $asset['deskripsi'] ?? '';
    $currentQty = 0;
    $metaData = [];
    $pureDesc = '';

    if (!empty($descriptionStr) && strpos($descriptionStr, '||META:') !== false) {
        $parts = explode('||', $descriptionStr);
        foreach ($parts as $part) {
            if (strpos($part, 'META:') === 0) {
                $base64Str = str_replace('META:', '', $part);
                $metaData = json_decode(base64_decode($base64Str), true) ?? [];
                $currentQty = isset($metaData['qty']) ? (int)$metaData['qty'] : 0;
            }
        }
        $pureDesc = isset($metaData['desc']) ? $metaData['desc'] : '';
    }

    if ($currentQty <= 0) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Maaf, stok kuantitas aset ini sudah kosong/habis!"]);
        exit;
    }


    $userId = $currentUser['id'] ?? $currentUser['user_id'] ?? 0;
    $userName = $currentUser['name'] ?? $currentUser['fullName'] ?? 'User Biasa';
    $userEmail = $currentUser['email'] ?? 'user@telkomuniversity.ac.id';
    $assetName = $asset['asset_name'] ?? $data->assetName ?? 'Alat Lab';
    $purposeReason = $data->reason ?? $data->purpose ?? 'Keperluan Praktikum';

   
    $sql = "INSERT INTO loans (user_id, userName, userEmail, asset_id, assetName, loan_date, return_date, purpose, borrowTime, returnTime, quantity, status, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'PENDING', ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $userId,
        $userName,
        $userEmail,
        (int)$data->assetId,
        $assetName,
        $startDate,
        $endDate,
        $purposeReason,
        $borrowTime,
        $returnTime, 
        $purposeReason
    ]);

    $newQty = $currentQty - 1;
    $metaData['qty'] = $newQty;
    $newEncodedDesc = "||META:" . base64_encode(json_encode($metaData)) . "|| " . $pureDesc;
    $newStatus = ($newQty <= 0) ? 'HABIS' : $asset['status'];

    $sqlUpdate = "UPDATE assets SET 
                    description = :description, 
                    deskripsi = :deskripsi,
                    status = :status,
                    QTY = :qty
                  WHERE id = :id";
    $stmtUpdate = $conn->prepare($sqlUpdate);
    $stmtUpdate->execute([
        ':description' => $newEncodedDesc,
        ':deskripsi'   => $newEncodedDesc,
        ':status'      => $newStatus,
        ':qty'         => $newQty, 
        ':id'          => (int)$data->assetId
      ]);


    require_once 'mail_helper.php';
    
    $kodeAsetMail = isset($asset['code']) ? $asset['code'] : '-';
    $labMail      = 'Laboratorium D3 Teknologi Telekomunikasi';

    if (!empty($userEmail)) {
        $subject = "[PRISMA FIT] Konfirmasi Peminjaman Aset";
        $contentBody = "
            <p>Halo, <b>" . htmlspecialchars($userName) . "</b>.</p>
            <p>Pengajuan peminjaman aset Anda telah berhasil terekam di sistem.</p>
            
            <div style='background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 15px; margin-top: 15px;'>
                <h4 style='margin: 0 0 10px 0; color: #1e1b4b;'>Detail Pengajuan</h4>
                <ul style='margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;'>
                    <li><b>Nama Aset:</b> " . htmlspecialchars($assetName) . "</li>
                    <li><b>Kode Aset:</b> " . htmlspecialchars($kodeAsetMail) . "</li>
                    <li><b>Laboratorium:</b> " . htmlspecialchars($labMail) . "</li>
                    <li><b>Tanggal Pinjam:</b> " . htmlspecialchars($startDate) . "</li>
                    <li><b>Waktu Pinjam:</b> " . htmlspecialchars($borrowTime) . " s/d " . htmlspecialchars($returnTime) . "</li>
                    <li><b>Status:</b> <span style='background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;'>Pending</span></li>
                </ul>
            </div>
            <br>
            <p>Mohon menunggu konfirmasi persetujuan fisik dari asisten laboratorium saat Anda mengambil alat.</p>
            <p>Teria kasih telah menggunakan PRISMA FIT.</p>
        ";
        sendEmail($userEmail, $userName, $subject, $contentBody);
    }

    echo json_encode(["status" => "success", "message" => "Permintaan izin peminjaman alat berhasil diajuka!"]);

} catch (PDOException $e) {
    error_log("request_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal eksekusi database: " . $e->getMessage()]);
}
?>