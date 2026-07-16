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

    $checkLoan = $conn->prepare("SELECT status FROM loans WHERE id = ? FOR UPDATE");
    $checkLoan->execute([$loanId]);
    $loan = $checkLoan->fetch();

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
    echo json_encode(["status" => "success", "message" => "Peminjaman disetujui!"]);
} catch (PDOException $e) {
    $conn->rollBack();
    error_log("approve_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memproses persetujuan."]);
}
?>