<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->fullName) &&
    !empty($data->username) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->phoneNumber) &&
    !empty($data->nim)
) {

    $name        = trim($data->fullName);     
    $username    = trim($data->username);     
    $email       = trim(strtolower($data->email)); 
    $password    = $data->password;
    $phone       = trim($data->phoneNumber); 
    $nim         = trim($data->nim);          

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format email tidak valid."]);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Password minimal 8 karakter."]);
        exit;
    }

    $role = "";
    if (str_ends_with($email, '@student.telkomuniversity.ac.id')) {
        $role = 'mahasiswa';
    } elseif (str_ends_with($email, '@employee.telkomuniversity.ac.id')) {
        $role = 'dosen';
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Gunakan email resmi Telkom University."]);
        exit;
    }

    try {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $check->execute([$email, $username]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email atau username sudah terdaftar."]);
            exit;
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

     
        $sql = "INSERT INTO users (name, username, email, password, phone, nim, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$name, $username, $email, $hashedPassword, $phone, $nim, $role]);


        require_once 'mail_helper.php';
        $registrationDate = date('Y-m-d H:i:s') . ' WIB';

        if (!empty($email)) {
            $subject = "[PRISMA FIT] Registrasi Berhasil";
            $contentBody = "
                <p>Halo, <b>" . htmlspecialchars($name) . "</b>.</p>
                <p>Terima kasih telah melakukan registrasi pada sistem PRISMA FIT (Proactive Integrated System for Management of Assets).</p>
                <p>Akun Anda telah <b>otomatis aktif</b> dan kini dapat langsung digunakan untuk login ke dalam sistem.</p>
                
                <div style='background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 15px; margin-top: 15px;'>
                    <h4 style='margin: 0 0 10px 0; color: #1e1b4b;'>Informasi Akun</h4>
                    <ul style='margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;'>
                        <li><b>Nama:</b> " . htmlspecialchars($name) . "</li>
                        <li><b>Email:</b> " . htmlspecialchars($email) . "</li>
                        <li><b>Role:</b> " . htmlspecialchars(ucfirst($role)) . "</li>
                        <li><b>Tanggal Registrasi:</b> {$registrationDate}</li>
                    </ul>
                </div>
                <br>
                <p>Silakan masuk melalui tautan berikut: <a href='https://prismafitd3tektel.site' style='color: #4f46e5; text-decoration: none; font-weight: bold;'>https://prismafitd3tektel.site</a></p>
                <p>Terima kasih telah menggunakan PRISMA FIT.</p>
            ";
            sendEmail($email, $name, $subject, $contentBody);
        }
       

        echo json_encode(["status" => "success", "message" => "Registrasi berhasil sebagai " . $role]);
    } catch (PDOException $e) {
        error_log("Register error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Registrasi gagal: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
}
?>