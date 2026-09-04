<?php
// upload_docs.php
require_once 'includes/auth.php'; // Safeguard session active
require_once 'includes/db.php';   // Load DB Connection

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $doc_id = trim(htmlspecialchars($_POST['uploadLetterSelect'] ?? ''));

    if (empty($doc_id)) {
        echo json_encode(['status' => 'error', 'message' => 'Please select a valid target generated letter.']);
        exit;
    }

    // Map input fields to database column names
    $slots = [
        'support_passport' => 'file_passport',
        'support_national_id' => 'file_national_id',
        'support_degree' => 'file_degree',
        'support_cv' => 'file_cv',
        'support_employment' => 'file_employment'
    ];

    $uploaded_paths = [];
    $allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png'];
    $max_file_size = 5 * 1024 * 1024; // 5MB

    // Verify upload folder exists
    $upload_dir = 'data/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    try {
        foreach ($slots as $post_key => $db_column) {
            if (isset($_FILES[$post_key]) && $_FILES[$post_key]['error'] === UPLOAD_ERR_OK) {
                $tmp_name = $_FILES[$post_key]['tmp_name'];
                $original_name = $_FILES[$post_key]['name'];
                $size = $_FILES[$post_key]['size'];

                $extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

                // 1. Validate File Extension
                if (!in_array($extension, $allowed_extensions)) {
                    throw new Exception("File format '.{$extension}' not supported for slot: " . str_replace('support_', '', $post_key));
                }

                // 2. Validate File Size
                if ($size > $max_file_size) {
                    throw new Exception("File size exceeds 5MB limit for slot: " . str_replace('support_', '', $post_key));
                }

                // 3. Generate clean, persistent filename
                $new_filename = "support_" . $doc_id . "_" . str_replace('support_', '', $post_key) . "." . $extension;
                $destination = $upload_dir . $new_filename;

                if (move_uploaded_file($tmp_name, $destination)) {
                    $uploaded_paths[$db_column] = $destination;
                } else {
                    throw new Exception("Failed to save physical file to storage folders.");
                }
            }
        }

        if (empty($uploaded_paths)) {
            echo json_encode(['status' => 'error', 'message' => 'No files were attached. Select at least one file to upload.']);
            exit;
        }

        // 4. Update the SQL DB with the file paths
        $update_fields = [];
        $params = [':doc_id' => $doc_id];

        foreach ($uploaded_paths as $column => $path) {
            $update_fields[] = "`$column` = :$column";
            $params[":$column"] = $path;
        }

        $sql = "UPDATE letters SET " . implode(", ", $update_fields) . " WHERE doc_id = :doc_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'status' => 'success',
            'message' => 'Supportive documents successfully uploaded and registered on the server.'
        ]);
        exit;

    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Upload failed: ' . $e->getMessage()
        ]);
        exit;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method.']);
    exit;
}
?>