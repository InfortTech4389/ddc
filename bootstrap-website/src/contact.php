<?php
/**
 * DIDC Contact Form Handler
 * Handles contact form submissions with spam protection
 */

// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Rate limiting (simple file-based)
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_file = __DIR__ . '/tmp/rate_limit_' . md5($ip) . '.txt';
$current_time = time();

// Create tmp directory if it doesn't exist
if (!is_dir(__DIR__ . '/tmp')) {
    mkdir(__DIR__ . '/tmp', 0755, true);
}

// Check rate limit (max 5 submissions per hour)
if (file_exists($rate_limit_file)) {
    $submissions = json_decode(file_get_contents($rate_limit_file), true) ?: [];
    $submissions = array_filter($submissions, function($time) use ($current_time) {
        return ($current_time - $time) < 3600; // 1 hour
    });
    
    if (count($submissions) >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }
} else {
    $submissions = [];
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!$input || !isset($input['name']) || !isset($input['email']) || !isset($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Honeypot check
if (!empty($input['website'])) {
    // Spam detected, return success but don't send email
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars(trim($input['name']));
$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
$company = htmlspecialchars(trim($input['company'] ?? ''));
$phone = htmlspecialchars(trim($input['phone'] ?? ''));
$subject = htmlspecialchars(trim($input['subject'] ?? 'General Inquiry'));
$message = htmlspecialchars(trim($input['message']));

// Validate email
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Validate message length
if (strlen($message) < 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is too short']);
    exit;
}

// Configuration
$to_email = $_ENV['CONTACT_EMAIL'] ?? 'hello@didc.global';
$from_email = 'noreply@didc.global';
$site_name = 'DIDC Website';

// Prepare email
$email_subject = "[$site_name] Contact Form: $subject";
$email_body = "
New contact form submission from $site_name

Name: $name
Email: $email
Company: " . ($company ?: 'Not provided') . "
Phone: " . ($phone ?: 'Not provided') . "
Subject: $subject

Message:
$message

---
Submitted on: " . date('Y-m-d H:i:s T') . "
IP Address: {$_SERVER['REMOTE_ADDR']}
User Agent: {$_SERVER['HTTP_USER_AGENT']}
";

// Email headers
$headers = [
    "From: $from_email",
    "Reply-To: $email",
    "Content-Type: text/plain; charset=utf-8",
    "X-Mailer: PHP/" . phpversion()
];

// Send email
$mail_sent = mail($to_email, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    // Update rate limiting
    $submissions[] = $current_time;
    file_put_contents($rate_limit_file, json_encode($submissions));
    
    // Log successful submission (optional)
    error_log("Contact form submission from $email");
    
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message. We will get back to you soon.'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message. Please try again later.']);
}
?>
