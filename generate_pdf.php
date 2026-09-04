<?php
// generate_pdf.php
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
        'issue_date' => trim(htmlspecialchars($_POST['issue_date'] ?? date('Y-m-d\TH:i'))),
        'expiry_date' => trim(htmlspecialchars($_POST['expiry_date'] ?? date('Y-m-d\TH:i', strtotime('+1 year')))),
        'authority' => trim(htmlspecialchars($_POST['authority'] ?? '')),
        'designation' => trim(htmlspecialchars($_POST['designation'] ?? '')),
        'salary' => trim(htmlspecialchars($_POST['salary'] ?? '')),
        'timezone' => trim(htmlspecialchars($_POST['timezone'] ?? 'UTC')),
        'generated_at' => date('Y-m-d H:i:s')
    ];

    // Save record to MySQL Database (Replaces old JSON file persistence)
    require_once 'includes/db.php';

    try {
        $sql = "INSERT INTO letters (doc_id, first_name, last_name, nationality, passport, dob, designation, salary, phone, email, certificate_title, issue_date, expiry_date, authority, timezone) 
                VALUES (:doc_id, :first_name, :last_name, :nationality, :passport, :dob, :designation, :salary, :phone, :email, :certificate_title, :issue_date, :expiry_date, :authority, :timezone)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':doc_id' => $data['doc_id'],
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':nationality' => $data['nationality'],
            ':passport' => $data['passport'],
            ':dob' => $data['dob'],
            ':designation' => $data['designation'],
            ':salary' => $data['salary'],
            ':phone' => $data['phone'],
            ':email' => $data['email'],
            ':certificate_title' => $data['certificate_title'],
            ':issue_date' => $data['issue_date'],
            ':expiry_date' => $data['expiry_date'],
            ':authority' => $data['authority'],
            ':timezone' => $data['timezone']
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database registration failed: ' . $e->getMessage()
        ]);
        exit;
    }

    // Generate public verification URL
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $verify_url = $protocol . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . "/verify.php?doc_id=" . $doc_id;

    // Return successful response payload back to JavaScript client
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