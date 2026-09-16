<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin']);

$data = json_decode(file_get_contents("php://input"), true);

$userId = $data['id'] ?? $data['userId'] ?? $data['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "ID user tidak ditemukan."
    ]);
    exit;
}

try {

    
    if ((int)$currentUser['id'] === (int)$userId) {
        throw new Exception("Admin tidak dapat menghapus akunnya sendiri.");
    }

   
    $stmt = $conn->prepare("SELECT id, name FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    if (!$stmt->fetch()) {
        throw new Exception("User tidak ditemukan.");
    }


    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    echo json_encode([
        "status" => "success",
        "message" => "User berhasil dihapus."
    ]);

} catch(Exception $e){

    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);

}