<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

try {
    $currentUser = requireAuth($conn);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Silakan login terlebih dahulu.", "redirect" => "login"]);
    exit;
}

$serialNumber = $_GET['serialNumber'] ?? null;

if (empty($serialNumber)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Serial number aset tidak valid."]);
    exit;
}

try {
    // 2. Cari aset berdasarkan kode unik / serial number di database Anda
    // Catatan: Sesuaikan nama kolom jika di database Anda kolomnya bernama 'code' atau 'serial_number'
    $stmt = $conn->prepare("SELECT id, asset_name, code, description, deskripsi, status FROM assets WHERE code = ? OR id = ?");
    $stmt->execute([$serialNumber, $serialNumber]);
    $asset = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$asset) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Aset dengan kode tersebut tidak ditemukan."]);
        exit;
    }

    // Unpack deskripsi/qty dari format Base64 khas kelompok Anda
    $descriptionStr = $asset['description'] ?? $asset['deskripsi'] ?? '';
    $currentQty = 0;
    $pureDesc = $descriptionStr;

    if (!empty($descriptionStr) && strpos($descriptionStr, '||META:') !== false) {
        $parts = explode('||', $descriptionStr);
        foreach ($parts as $part) {
            if (strpos($part, 'META:') === 0) {
                $base64Str = str_replace('META:', '', $part);
                $metaData = json_decode(base64_decode($base64Str), true) ?? [];
                $currentQty = isset($metaData['qty']) ? (int)$metaData['qty'] : 0;
                $pureDesc = isset($metaData['desc']) ? $metaData['desc'] : '';
            }
        }
    }

    // Ambil role user saat ini secara lowercase
    $role = strtolower($currentUser['role'] ?? '');

    
    if ($role === 'mahasiswa') {
        
        echo json_encode([
            "status" => "success",
            "role_action" => "borrow",
            "message" => "Akses diizinkan untuk peminjaman.",
            "data" => [
                "id" => $asset['id'],
                "name" => $asset['asset_name'],
                "code" => $asset['code'] ?? $serialNumber,
                "qty" => $currentQty
            ]
        ]);
    } 
    elseif ($role === 'admin' || $role === 'asisten laboratorium' || $role === 'asisten lab' || $role === 'aslab') {
        
        echo json_encode([
            "status" => "success",
            "role_action" => "edit",
            "message" => "Akses dialihkan ke halaman pengelolaan aset.",
            "data" => [
                "id" => $asset['id'],
                "name" => $asset['asset_name'],
                "code" => $asset['code'] ?? $serialNumber,
                "qty" => $currentQty,
                "status" => $asset['status'],
                "description" => $pureDesc
            ]
        ]);
    } 
    elseif ($role === 'dosen') {
        
        echo json_encode([
            "status" => "success",
            "role_action" => "view_only",
            "message" => "Akses hanya melihat data (Read-Only).",
            "data" => [
                "id" => $asset['id'],
                "name" => $asset['asset_name'],
                "code" => $asset['code'] ?? $serialNumber,
                "qty" => $currentQty,
                "status" => $asset['status'],
                "description" => $pureDesc
            ]
        ]);
    } 
    else {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Role Anda tidak memiliki otorisasi fitur ini."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server database bermasalah: " . $e->getMessage()]);
}
?>