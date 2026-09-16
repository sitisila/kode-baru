<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

try {
    $currentUser = requireAuth($conn);
} catch (Exception $e) {

}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' || $method === 'PUT') {
    $body = json_decode(file_get_contents("php://input"), true);
    
    $userId = $body['userId'] ?? $body['id'] ?? null;
    $newRole = $body['role'] ?? $body['newRole'] ?? null;

    if (!$userId || !$newRole) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
        $stmt->execute([$newRole, $userId]);
        echo json_encode(["status" => "success", "message" => "Role berhasil diubah menjadi " . $newRole]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
        exit;
    }
}

if ($method === 'GET') {
    try {

        $query = "SELECT 
                    id, 
                    name AS fullName, 
                    username, 
                    email, 
                    COALESCE(NIM, '-') AS nim, 
                    phone AS phoneNumber, 
                    role 
                  FROM users 
                  ORDER BY name ASC";
                  
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "status" => "success",
            "data" => $users ? $users : []
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Gagal mengambil data database: " . $e->getMessage(),
            "data" => []
        ]);
        exit;
    }
}
?>