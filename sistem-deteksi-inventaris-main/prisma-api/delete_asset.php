<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin']);

$data = json_decode(file_get_contents('php://input'), true);
$id   = $data['id'] ?? $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID aset tidak ditemukan."]);
    exit;
}

try {
    $check = $conn->prepare("SELECT status FROM assets WHERE id = ?");
    $check->execute([$id]);
    $asset = $check->fetch();

    if (!$asset) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Aset tidak ditemukan."]);
        exit;
    }
    if ($asset['status'] === 'BORROWED') {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Tidak dapat menghapus aset yang sedang dipinjam."]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM assets WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["status" => "success", "message" => "Aset berhasil dihapus."]);
} catch (PDOException $e) {
    error_log("delete_asset error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal menghapus aset."]);
}
?>