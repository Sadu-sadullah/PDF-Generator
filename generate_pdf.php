<?php
// Start session and verify authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Your session has expired. Please refresh the page and log in again.'
    ]);
    exit;
}

header('Content-Type: application/json');

// Ensure error reporting doesn't output HTML warnings in the middle of JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Auto-check: Create data directory if it doesn't exist
    $dir = 'data';
    if (!file_exists($dir)) {
        if (!mkdir($dir, 0777, true)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'The "data/" folder does not exist and could not be created automatically. Please create a folder named "data" in the project root.'
            ]);
            exit;
        }
    }

    // Auto-check: Verify write permissions
    if (!is_writable($dir)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'The "data/" folder exists but is not writable. Please update the folder permissions so PHP can save records.'
        ]);
        exit;
    }

    $doc_id = 'DOC-2026-' . strtoupper(substr(md5(uniqid()), 0, 6));

    $data = [
        'doc_id' => $doc_id,
        'first_name' => trim(htmlspecialchars($_POST['first_name'] ?? '')),
        'last_name' => trim(htmlspecialchars($_POST['last_name'] ?? '')),
        'nationality' => trim(htmlspecialchars($_POST['nationality'] ?? '')),
        'passport' => trim(htmlspecialchars($_POST['passport'] ?? '')),
        'dob' => trim(htmlspecialchars($_POST['dob'] ?? '')),
        'phone' => trim(htmlspecialchars($_POST['phone'] ?? '')),
        'email' => trim(htmlspecialchars($_POST['email'] ?? '')),
        'certificate_title' => trim(htmlspecialchars($_POST['certificate_title'] ?? '')),
        'issue_date' => trim(htmlspecialchars($_POST['issue_date'] ?? date('Y-m-d'))),
        'expiry_date' => trim(htmlspecialchars($_POST['expiry_date'] ?? date('Y-m-d', strtotime('+1 year')))),
        'authority' => trim(htmlspecialchars($_POST['authority'] ?? '')),
        'generated_at' => date('Y-m-d H:i:s')
    ];

    $json_file = $dir . '/records.json';
    $records = [];

    if (file_exists($json_file)) {
        $file_content = file_get_contents($json_file);
        $records = json_decode($file_content, true) ?: [];
    }

    $records[$doc_id] = $data;

    if (file_put_contents($json_file, json_encode($records, JSON_PRETTY_PRINT)) === false) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to write data to records.json. Check write permissions.'
        ]);
        exit;
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $verify_url = $protocol . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . "/verify.php?doc_id=" . $doc_id;

    echo json_encode([
        'status' => 'success',
        'doc_id' => $doc_id,
        'verify_url' => $verify_url,
        'data' => $data
    ]);
    exit;
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid Request Method.'
    ]);
    exit;
}
?>