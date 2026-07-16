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
    $checkLoan = $conn->prepare("SELECT status FROM loans WHERE id = ?");
    $checkLoan->execute([$loanId]);
    $loan = $checkLoan->fetch();

    if (!$loan || $loan['status'] !== 'PENDING') {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Peminjaman ini sudah diproses sebelumnya."]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE loans SET status = 'REJECTED' WHERE id = ?");
    $stmt->execute([$loanId]);

    echo json_encode(["status" => "success", "message" => "Peminjaman ditolak"]);
} catch (PDOException $e) {
    error_log("reject_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memproses penolakan."]);
}
?>