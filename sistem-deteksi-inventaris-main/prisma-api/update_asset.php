<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "prisma_fit";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

include 'config.php';
include 'auth.php';

// 🔒 Validasi akun login
$currentUser = requireAuth($conn);

$rawData = json_decode(file_get_contents("php://input"), true) ?? [];
$postData = $_POST ?? [];
$payload = array_merge($rawData, $postData);

$id = !empty($payload['id']) ? (int)$payload['id'] : null;

// 🔎 MAPPING DATA SESUAI STRUKTUR DATABASE RIL KELOMPOK LU
$name         = $payload['asset_name'] ?? $payload['name'] ?? 'Alat Baru';
$serialNumber = !empty($payload['serialNumber']) ? $payload['serialNumber'] : bin2hex(random_bytes(6));
$asset_code   = $payload['assetCode'] ?? $payload['asset_code'] ?? $serialNumber; 
$category     = $payload['category'] ?? 'Umum';
$lab          = $payload['lab'] ?? 'Ruangan Admin';
$specLoc      = $payload['specificLocation'] ?? $payload['location'] ?? '';
$condition    = $payload['conditionStatus'] ?? $payload['status_kelayakan'] ?? 'Baik';
$status       = $payload['status'] ?? 'Tersedia';
$funding      = $payload['fundingSource'] ?? $payload['sumber_pendanaan'] ?? '';
$invoice      = $payload['invoiceNumber'] ?? $payload['no_invoice'] ?? '';

$brandType    = $payload['brandType'] ?? '';
$procYear     = $payload['procurementYear'] ?? '';
$accessories  = $payload['accessories'] ?? '';

// 🎯 MENANGKAP QUANTITY SECARA TOLERAN DARI FRONTEND
$quantity     = isset($payload['QTY']) ? (int)$payload['QTY'] : (isset($payload['qty']) ? (int)$payload['qty'] : (isset($payload['quantity']) ? (int)$payload['quantity'] : 1));
$description  = $payload['description'] ?? $payload['deskripsi'] ?? '';

// PACKING DATA KE META BASE64 (Biar sistem lama kelompok lu gak pincang)
$metaData = [
    "brand" => $brandType,
    "year" => $procYear,
    "acc" => $accessories,
    "qty" => $quantity,
    "desc" => $description
];
$encodedDesc = "||META:" . base64_encode(json_encode($metaData)) . "|| " . $description;

try {
    if ($id && $id > 0) {
        // 🔥 QUERY FIX UPDATE: Sekarang aman memasukkan QTY karena kolom sudah dibuat (Gambar image_0c9c6b.png)
        $sql = "UPDATE assets SET 
                    serialNumber = :serialNumber, 
                    asset_code = :asset_code, 
                    asset_name = :asset_name, 
                    category = :category, 
                    location = :location, 
                    lab = :lab, 
                    status = :status, 
                    description = :description, 
                    sumber_pendanaan = :sumber_pendanaan, 
                    no_invoice = :no_invoice, 
                    status_kelayakan = :status_kelayakan, 
                    deskripsi = :deskripsi,
                    QTY = :qty
                WHERE id = :id";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':serialNumber'     => $serialNumber,
            ':asset_code'       => $asset_code,
            ':asset_name'       => $name,
            ':category'         => $category,
            ':location'         => $specLoc,
            ':lab'              => $lab,
            ':status'           => $status,
            ':description'      => $encodedDesc,
            ':sumber_pendanaan' => $funding,
            ':no_invoice'       => $invoice,
            ':status_kelayakan' => $condition,
            ':deskripsi'        => $encodedDesc,
            ':qty'              => $quantity, // 🎯 Menyimpan angka stok langsung ke database
            ':id'               => $id
        ]);
        
        echo json_encode(["status" => "success", "message" => "Aset berhasil diperbarui!"]);
    } else {

        $sql = "INSERT INTO assets (serialNumber, asset_code, asset_name, category, location, lab, status, description, sumber_pendanaan, no_invoice, status_kelayakan, deskripsi, QTY) 
                VALUES (:serialNumber, :asset_code, :asset_name, :category, :location, :lab, :status, :description, :sumber_pendanaan, :no_invoice, :status_kelayakan, :deskripsi, :qty)";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':serialNumber'     => $serialNumber,
            ':asset_code'       => $asset_code,
            ':asset_name'       => $name,
            ':category'         => $category,
            ':location'         => $specLoc,
            ':lab'              => $lab,
            ':status'           => $status,
            ':description'      => $encodedDesc,
            ':sumber_pendanaan' => $funding,
            ':no_invoice'       => $invoice,
            ':status_kelayakan' => $condition,
            ':deskripsi'        => $encodedDesc,
            ':qty'              => $quantity // 🎯 Menyimpan angka stok langsung ke database
        ]);
        
        echo json_encode(["status" => "success", "message" => "Aset baru berhasil disimpan!"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal eksekusi database: " . $e->getMessage()]);
}
exit;
?>