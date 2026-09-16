<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

include 'config.php';
if (file_exists('auth.php')) { include 'auth.php'; }

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $isPasswordValid = ($data->password === $user['password']) || password_verify($data->password, $user['password']);

            if ($isPasswordValid) {
                
                unset($user['password']); 
                
                $userId = (int)$user['id']; 
                
                
                $token = bin2hex(random_bytes(32));
                
                
                $expires_at = date('Y-m-d H:i:s', strtotime('+1 day'));
                
                $tokenStmt = $conn->prepare("INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
                $tokenStmt->execute([$userId, $token, $expires_at]);
                
                echo json_encode([
                    "status" => "success",
                    "user" => [
                        "id" => (string)$user['id'],
                        "name" => $user['name'],
                        "username" => $user['username'],
                        "nim" => $user['nim'],
                        "email" => $user['email'],
                        "phone" => $user['phone'],
                        "role" => strtoupper($user['role'])
                    ],
                    "token" => $token
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Email dan Password wajib diisi!"]);
}
?>