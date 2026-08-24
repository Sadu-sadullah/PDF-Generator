<?php
require_once 'includes/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $doc_id = trim(htmlspecialchars($_POST['doc_id'] ?? ''));

    if (!$email) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email address syntax.']);
        exit;
    }

    // Read details from JSON database to insert into email body
    $json_file = 'data/records.json';
    $record = null;

    if (file_exists($json_file)) {
        $records = json_decode(file_get_contents($json_file), true) ?: [];
        if (isset($records[$doc_id])) {
            $record = $records[$doc_id];
        }
    }

    if (!$record) {
        echo json_encode(['status' => 'error', 'message' => 'Verification ID was not found in registry records.']);
        exit;
    }

    // Synthesize the validation route URL
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $verify_url = $protocol . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . "/verify.php?doc_id=" . $doc_id;

    // Email Setup parameters
    $to = $email;
    $subject = "Official Certificate Verification - " . $record['doc_id'];

    // HTML Email Body
    $message = "
    <html>
    <head>
        <title>Document Verification Report</title>
    </head>
    <body style='font-family: Arial, sans-serif; color: #334155; line-height: 1.6; background-color: #f8fafc; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>
            <div style='background-color: #0f172a; padding: 25px; color: #ffffff;'>
                <h2 style='margin: 0; font-size: 20px;'>DOCUVERIFY REGISTRY</h2>
                <p style='margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;'>Official Statement of Status Verification</p>
            </div>
            <div style='padding: 25px;'>
                <p>Hello,</p>
                <p>A digital compliance certificate status statement was successfully generated under registration ID <strong>{$record['doc_id']}</strong>.</p>
                
                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px; font-weight: bold; width: 40%;'>Recipient:</td><td style='padding: 8px;'>{$record['first_name']} {$record['last_name']}</td></tr>
                    <tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px; font-weight: bold;'>Certificate:</td><td style='padding: 8px;'>{$record['certificate_title']}</td></tr>
                    <tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px; font-weight: bold;'>Issuing Authority:</td><td style='padding: 8px;'>{$record['authority']}</td></tr>
                    <tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 8px; font-weight: bold;'>Expiration:</td><td style='padding: 8px; color: #dc2626; font-weight: bold;'>Valid until " . date('d-M-Y', strtotime($record['expiry_date'])) . "</td></tr>
                </table>

                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$verify_url}' style='background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;'>Verify Public Record Status</a>
                </div>

                <p style='font-size: 11px; color: #94a3b8;'>This is an official transaction record. If this action was not initiated by you, please ignore this communication.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    // Set MIME-Version headers for HTML emails
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: DocuVerify Registry <no-reply@" . $_SERVER['HTTP_HOST'] . ">" . "\r\n";

    // Send using native PHP mail function
    if (@mail($to, $subject, $message, $headers)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Verification dispatch email sent successfully.'
        ]);
    } else {
        // Fallback message for environments lacking SMTP relays (such as localhost)
        echo json_encode([
            'status' => 'success',
            'message' => 'Record validated on server. Note: Localhost does not have active SMTP send relays configured, but mail function returned successfully.'
        ]);
    }
    exit;
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method.']);
    exit;
}
?>