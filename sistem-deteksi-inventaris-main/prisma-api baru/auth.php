<?php

function requireAuth(PDO $conn): array {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');

    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Token akses tidak ditemukan. Silakan login kembali."]);
        exit;
    }

    $token = trim($matches[1]);

    try {
        $stmt = $conn->prepare(
            "SELECT u.* FROM user_tokens t
             JOIN users u ON u.id = t.user_id
             WHERE t.token = ? AND t.expires_at > NOW()"
        );
        $stmt->execute([$token]);
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali."]);
            exit;
        }

        if (isset($user['password'])) {
            unset($user['password']);
        }
        
        return $user;
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal memvalidasi sesi: " . $e->getMessage()]);
        exit;
    }
}

function requireRole(array $user, array $allowedRoles): void {

    $userRole = isset($user['role']) ? strtolower(trim((string)$user['role'])) : '';
    $allowed  = array_map('strtolower', $allowedRoles);

    if (!in_array($userRole, $allowed, true)) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Anda tidak memiliki izin untuk melakukan aksi ini."]);
        exit;
    }
}
?>