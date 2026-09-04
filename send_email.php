<?php
// send_email.php
require_once 'includes/auth.php';        // Safeguard session active
require_once 'includes/smtp_config.php'; // Load SMTP parameters

header('Content-Type: application/json');

// Verify Composer autoloader exists
if (file_exists('vendor/autoload.php')) {
    require_once 'vendor/autoload.php';
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Composer dependencies missing. Run "composer require phpmailer/phpmailer" in your terminal.'
    ]);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $to = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $subject = trim(htmlspecialchars($_POST['subject'] ?? ''));
    $message_body = trim($_POST['message'] ?? ''); // Allow raw linebreaks for message formatting
    $doc_id = trim(htmlspecialchars($_POST['doc_id'] ?? ''));

    if (!$to) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid or missing recipient email address.']);
        exit;
    }

    if (empty($subject) || empty($message_body)) {
        echo json_encode(['status' => 'error', 'message' => 'Subject or message body cannot be empty.']);
        exit;
    }

    // Initialize secure PHPMailer Instance
    $mail = new PHPMailer(true);

    try {
        // SMTP Server configuration
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;

        // Timeout limits (Prevents hanging on slow local SMTP connections)
        $mail->Timeout = 15;

        // Sender & Recipient parameters
        $mail->setFrom(SMTP_USER, SMTP_FROM_NAME);
        $mail->addAddress($to);

        // Capture and attach dynamic PDF binary payload from multipart request
        if (isset($_FILES['pdf_file']) && $_FILES['pdf_file']['error'] === UPLOAD_ERR_OK) {
            $mail->addAttachment($_FILES['pdf_file']['tmp_name'], $_FILES['pdf_file']['name']);
        }

        // Email Body Content Setup
        $mail->isHTML(true);
        $mail->Subject = $subject;

        // Convert plain text linebreaks to HTML breaks for spacing preservation
        $mail->Body = nl2br(htmlspecialchars($message_body));
        $mail->AltBody = strip_tags($message_body);

        // Execute secure SMTP Dispatch
        $mail->send();

        echo json_encode([
            'status' => 'success',
            'message' => 'Email successfully compiled and sent with PDF attachment.'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Mailing server failed to dispatch: ' . $mail->ErrorInfo
        ]);
    }
    exit;
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method.']);
    exit;
}
?>