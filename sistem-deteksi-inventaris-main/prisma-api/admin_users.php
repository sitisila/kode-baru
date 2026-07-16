<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); } 

$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "prisma_fit";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_host == 'localhost' ? $db_user : 'root', $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Gagal koneksi database Laragon: " . $e->getMessage()
    ]);
    exit;
}

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin']);

$method = $_SERVER['REQUEST_METHOD'];


if ($method === 'GET') {
    $users = []; 
    try {
        $sql = "SELECT id, name, username, email, phone, role FROM users ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formattedUsers = array_map(function($user) {
            return [
                "id" => $user['id'],
                "name" => $user['name'],
                "fullName" => $user['name'],
                "username" => $user['username'],
                "email" => $user['email'],
                "phone" => $user['phone'],
                "phoneNumber" => $user['phone'],
                "role" => $user['role']
            ];
        }, $users);

        echo json_encode([
            "status" => "success",
            "data" => $formattedUsers
        ]);
    } catch(PDOException $e) {
        http_response_code(500); 
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
    exit;
}


if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));


    $targetUserId = $data->userId ?? $data->id ?? $data->user_id ?? null;
    
  
    $targetRole   = $data->role ?? $data->newRole ?? null;

    if (!empty($targetUserId) && !empty($targetRole)) {
        try {
            // Ambil info nama & email user sebelum role diubah untuk dikirimi email
            $stmtUser = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
            $stmtUser->execute([(int)$targetUserId]);
            $userTargetData = $stmtUser->fetch(PDO::FETCH_ASSOC);

            // Jalankan update database
            $sql = "UPDATE users SET role = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$targetRole, $targetUserId]);

            // =========================================================================
            // ⚡ EMAIL NOTIFIKASI UPGRADE / PERUBAHAN ROLE MEMBER
            // =========================================================================
            if ($userTargetData && !empty($userTargetData['email'])) {
                require_once 'mail_helper.php';
                
                $targetName  = $userTargetData['name'];
                $targetEmail = $userTargetData['email'];
                $displayRole = ucwords($targetRole);

                $subject = "[PRISMA FIT] Pembaruan Tingkat Akses Akun";
                $contentBody = "
                    <p>Halo, <b>" . htmlspecialchars($targetName) . "</b>.</p>
                    <p>Akun Anda pada sistem PRISMA FIT telah berhasil diperbarui status hak aksesnya oleh Administrator.</p>
                    
                    <div style='background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 15px; margin-top: 15px;'>
                        <h4 style='margin: 0 0 10px 0; color: #1e1b4b;'>Informasi Akses Baru</h4>
                        <ul style='margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;'>
                            <li><b>Nama Pengguna:</b> " . htmlspecialchars($targetName) . "</li>
                            <li><b>Email:</b> " . htmlspecialchars($targetEmail) . "</li>
                            <li><b>Role Baru:</b> <span style='color: #4f46e5; font-weight: bold;'>{$displayRole}</span></li>
                        </ul>
                    </div>
                    <br>
                    <p>Perubahan ini memberikan Anda otorisasi akses menu baru di dalam sistem sesuai fungsi role Anda.</p>
                    <p>Silakan login kembali ke website untuk melihat perubahannya: <a href='https://prismafitd3tektel.site' style='color: #4f46e5; text-decoration: none; font-weight: bold;'>https://prismafitd3tektel.site</a></p>
                    <p>Terima kasih atas kerja samanya.</p>
                ";
                sendEmail($targetEmail, $targetName, $subject, $contentBody);
            }
            // =========================================================================

            echo json_encode([
                "status" => "success",
                "message" => "Role berhasil diperbarui!"
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal memperbarui database: " . $e->getMessage()
            ]);
        }
    } else {
        http_response_code(400);
        
        echo json_encode([
            "status" => "error",
            "message" => "Data tidak lengkap.",
            "debug_received" => $data
        ]);
    }
    exit;
}
?>