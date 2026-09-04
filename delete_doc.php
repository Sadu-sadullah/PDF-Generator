<?php
// delete_doc.php
require_once 'includes/auth.php'; // Safeguard session active
require_once 'includes/db.php';   // Load DB Connection

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $doc_id = trim(htmlspecialchars($_POST['doc_id'] ?? ''));
    $slot = trim(htmlspecialchars($_POST['slot'] ?? ''));

    if (empty($doc_id) || empty($slot)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid deletion parameters provided.']);
        exit;
    }

    // Map keys to secure database columns
    $slots = [
        'passport' => 'file_passport',
        'national_id' => 'file_national_id',
        'degree' => 'file_degree',
        'cv' => 'file_cv',
        'employment' => 'file_employment'
    ];

    if (!isset($slots[$slot])) {
        echo json_encode(['status' => 'error', 'message' => 'Unrecognized document slot target.']);
        exit;
    }

    $db_column = $slots[$slot];

    try {
        // 1. Fetch current file path from database
        $stmt = $pdo->prepare("SELECT `$db_column` FROM letters WHERE doc_id = :doc_id");
        $stmt->execute([':doc_id' => $doc_id]);
        $row = $stmt->fetch();

        if ($row && !empty($row[$db_column])) {
            $file_path = $row[$db_column];

            // Security check: Verify file is inside the standard data/ directory before unlinking
            if (strpos($file_path, 'data/') === 0 && file_exists($file_path)) {
                unlink($file_path); // Delete physical file from server disk
            }
        }

        // 2. Set database column value back to NULL
        $sql = "UPDATE letters SET `$db_column` = NULL WHERE doc_id = :doc_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':doc_id' => $doc_id]);

        echo json_encode([
            'status' => 'success',
            'message' => 'File successfully unlinked and removed from database.'
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database deletion transaction failed: ' . $e->getMessage()
        ]);
        exit;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method.']);
    exit;
}
?>