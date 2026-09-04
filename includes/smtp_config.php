<?php
// includes/smtp_config.php
// Secure configuration parameters for your personal SMTP relay

define('SMTP_HOST', 'smtp.gmail.com');          // Gmail SMTP Server
define('SMTP_PORT', 587);                       // Port 587 is standard for STARTTLS
define('SMTP_SECURE', 'tls');                   // Enforce TLS encryption
define('SMTP_USER', 'chatterboxishere@gmail.com');  // Your personal Gmail address

// CRITICAL SECURITY NOTE FOR GMAIL:
// Do NOT use your standard account password here. Because Gmail has Multi-Factor Authentication active,
// you must generate a 16-digit "App Password" from your Google Account settings and paste it here.
define('SMTP_PASS', 'xqnz fxsc husp pdef');

define('SMTP_FROM_NAME', 'DocuVerify Registry');
?>