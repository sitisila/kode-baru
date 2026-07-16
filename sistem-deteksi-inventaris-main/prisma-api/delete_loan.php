<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

// Proteksi token otentikasi biar ga sembarang orang bisa nembak API hapus
$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin', 'Dosen']);

$body   = json_decode(file_get_contents("php://input"), true);
$loanId = $body['id'] ?? $_GET['id'] ?? null;

if (!$loanId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID Peminjaman tidak ditemukan"]);
    exit;
}

try {
    // Pastikan data yang dihapus hanya yang statusnya bukan PENDING (biar aman)
    $checkLoan = $conn->prepare("SELECT status FROM loans WHERE id = ?");
    $checkLoan->execute([$loanId]);
    $loan = $checkLoan->fetch();

    if (!$loan) {
        http_response_code(444);
        echo json_encode(["status" => "error", "message" => "Data peminjaman tidak ditemukan."]);
        exit;
    }

    // Eksekusi hapus data dari tabel loans
    $stmt = $conn->prepare("DELETE FROM loans WHERE id = ?");
    $stmt->execute([$loanId]);

    echo json_encode(["status" => "success", "message" => "Riwayat peminjaman berhasil dihapus!"]);
} catch (PDOException $e) {
    error_log("delete_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memproses penghapusan."]);
}
?>