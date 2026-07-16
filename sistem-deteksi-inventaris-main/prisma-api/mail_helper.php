<?php

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require_once 'smtp_config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendEmail($toEmail, $toName, $subject, $contentBody) {
    $mail = new PHPMailer(true);
    try {
       
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;

        
        $mail->setFrom(SMTP_USER, SMTP_FROM_NAME);
        $mail->addAddress($toEmail, $toName);

       
        $mail->isHTML(true);
        $mail->Subject = $subject;
        
        
        $fullTemplate = "
        <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;'>
            <div style='margin-bottom: 20px;'>
                {$contentBody}
            </div>
            
            <div style='margin-top: 30px; padding-top: 20px; border-top: 2px dashed #e2e8f0; font-size: 12px; color: #64748b;'>
                <p style='margin: 0; font-weight: bold; color: #1e1b4b; font-size: 14px;'>PRISMA FIT</p>
                <p style='margin: 2px 0; font-style: italic; color: #4f46e5;'>Proactive Integrated System for Management of Assets</p>
                <p style='margin: 8px 0 2px 0;'>Sistem Manajemen Inventaris Laboratorium</p>
                <p style='margin: 2px 0;'>D3 Teknologi Telekomunikasi</p>
                <p style='margin: 2px 0;'>Fakultas Ilmu Terapan</p>
                <p style='margin: 2px 0;'>Telkom University</p>
                <br>
                <p style='margin: 2px 0;'><b>Website:</b> <a href='https://prismafitd3tektel.site' style='color: #4f46e5; text-decoration: none;'>https://prismafitd3tektel.site</a></p>
                <p style='margin: 2px 0;'><b>Email:</b> noreply@prismafitd3tektel.site</p>
                <hr style='border: 0; border-top: 1px solid #f1f5f9; margin: 15px 0;'>
                <p style='font-size: 11px; color: #94a3b8; text-align: center; margin: 0;'>
                    Email ini dikirim secara otomatis oleh sistem.<br>Mohon tidak membalas email ini.
                </p>
            </div>
        </div>
        ";

        $mail->Body = $fullTemplate;
        $mail->send();
        return true;
    } catch (Exception $e) {
        
        error_log("PRISMA FIT Notif Error: Pengiriman email ke {$toEmail} gagal. Detail Error: {$mail->ErrorInfo}");
        return false;
    }
}
?>