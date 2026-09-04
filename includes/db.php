<?php
// includes/db.php
$host = 'localhost';
$db = 'docuverify_db';
$user = 'root';        // Replace with your database username
$pass = '';            // Replace with your database password
$charset = 'utf8mb4';

// Connect to the MySQL server host directly without selecting a database first
$dsnWithoutDb = "mysql:host=$host;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    // 1. Establish initial connection to MySQL server
    $pdo = new PDO($dsnWithoutDb, $user, $pass, $options);

    // 2. Self-Check: Create the database automatically if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // 3. Connect/select the newly verified database
    $pdo->exec("USE `$db`");

    // 4. Self-Check: Create the letters table automatically if it doesn't exist
    $tableSql = "CREATE TABLE IF NOT EXISTS letters (
        doc_id VARCHAR(50) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        passport VARCHAR(50) NOT NULL,
        dob DATE NOT NULL,
        designation VARCHAR(100) NOT NULL,
        salary VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        certificate_title VARCHAR(150) NOT NULL,
        issue_date DATETIME NOT NULL,
        expiry_date DATETIME NOT NULL,
        authority VARCHAR(255) NOT NULL,
        timezone VARCHAR(20) NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($tableSql);

} catch (\PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Database self-initialization failed: ' . $e->getMessage()
    ]);
    exit;
}
?>