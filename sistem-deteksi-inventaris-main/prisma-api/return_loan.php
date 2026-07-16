<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

// Validasi token sesi user logined
$currentUser = requireAuth($conn);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->loanId) || empty($data->assetId) || empty($data->photo)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Seluruh kolom formulir dan foto bukti wajib diisi."]);
    exit;
}

try {
    // 1. Gabungkan data ke string formal (Menggunakan Baik / Layak, dll)
    $chosenCondition = !empty($data->condition) ? $data->condition : 'Baik / Layak';
    $finalNotes = "Kondisi: " . $chosenCondition . " | Catatan: " . $data->notes . " | Foto Bukti: " . $data->photo;
    
    // Update status transaksi log peminjaman di tabel loans menjadi DIKEMBALIKAN
    $stmt = $conn->prepare("UPDATE loans SET status = 'DIKEMBALIKAN', notes = ? WHERE id = ?");
    $stmt->execute([$finalNotes, (int)$data->loanId]);


    $checkAsset = $conn->prepare("SELECT asset_name, description, deskripsi, status, code FROM assets WHERE id = ?");
    $checkAsset->execute([(int)$data->assetId]);
    $asset = $checkAsset->fetch(PDO::FETCH_ASSOC);

    if ($asset) {
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

        $newQty = $currentQty + 1;
        
  
        $metaData['qty'] = $newQty;
        $metaData['condition'] = $chosenCondition; 

        $newEncodedDesc = "||META:" . base64_encode(json_encode($metaData)) . "|| " . $pureDesc;
        $newStatus = ($newQty > 0) ? 'TERSEDIA' : $asset['status'];

       
        $sqlUpdate = "UPDATE assets SET description = :description, deskripsi = :deskripsi, status = :status, QTY = :qty WHERE id = :id";
        $stmtUpdate = $conn->prepare($sqlUpdate);
        $stmtUpdate->execute([
            ':description' => $newEncodedDesc,
            ':deskripsi'   => $newEncodedDesc,
            ':status'      => $newStatus,
            ':qty'         => $newQty, 
            ':id'          => (int)$data->assetId
        ]);
    }

    require_once 'mail_helper.php';

    $userEmail = $currentUser['email'] ?? '';
    $userName  = $currentUser['name'] ?? 'Mahasiswa';
    
    $namaAsetMail = $asset['asset_name'] ?? 'Aset';
    $kodeAsetMail = $asset['code'] ?? '-';
    $tanggalKembaliMail = date('Y-m-d H:i') . ' WIB';

    if (!empty($userEmail)) {
        $subject = "[PRISMA FIT] Konfirmasi Pengembalian Aset";
        $contentBody = "
            <p>Halo, <b>" . htmlspecialchars($userName) . "</b>.</p>
            <p>Pengembalian aset Anda telah berhasil tercatat oleh sistem.</p>
            
            <div style='background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 15px; margin-top: 15px;'>
                <h4 style='margin: 0 0 10px 0; color: #1e1b4b;'>Detail Pengembalian</h4>
                <ul style='margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;'>
                    <li><b>Nama Aset:</b> " . htmlspecialchars($namaAsetMail) . "</li>
                    <li><b>Kode Aset:</b> " . htmlspecialchars($kodeAsetMail) . "</li>
                    <li><b>Tanggal Kembali:</b> {$tanggalKembaliMail}</li>
                    <li><b>Kondisi Barang:</b> " . htmlspecialchars($chosenCondition) . "</li>
                    <li><b>Status:</b> <span style='background-color: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;'>Dikembalikan</span></li>
                </ul>
            </div>
            <br>
            <p>Terima kasih telah merawat dan mengembalikan aset laboratorium tepat waktu.</p>
            <p>Terima kasih telah menggunakan PRISMA FIT.</p>
        ";
        sendEmail($userEmail, $userName, $subject, $contentBody);
    }

    echo json_encode(["status" => "success", "message" => "Barang berhasil dikembalikan!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengeksekusi ke database: " . $e->getMessage()]);
}
?>