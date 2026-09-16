<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);

try {

    $query = "SELECT 
                l.*, 
                u.name AS borrower_name, 
                u.nim AS nim, 
                u.phone AS phone,
                a.asset_name AS asset_name
              FROM loans l
              INNER JOIN users u ON l.user_id = u.id
              INNER JOIN assets a ON l.asset_id = a.id
              ORDER BY l.id DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    error_log("get_loans error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengambil data peminjaman."]);
}
?>