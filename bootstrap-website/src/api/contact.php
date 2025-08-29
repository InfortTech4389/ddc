<?php
/**
 * DIDC Contact Form Handler
 * Professional contact form processing with validation, security, and CRM integration
 */

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS for AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: https://didc.com');
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Rate limiting check (simple implementation)
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$time = time();
$rate_limit_key = "contact_form_{$ip}";

if (isset($_SESSION[$rate_limit_key]) && $_SESSION[$rate_limit_key] > $time - 300) {
    http_response_code(429);
    exit('Rate limit exceeded. Please wait 5 minutes before submitting again.');
}

// Configuration
$config = [
    'smtp_host' => 'smtp.didc.com',
    'smtp_port' => 587,
    'smtp_username' => 'noreply@didc.com',
    'smtp_password' => getenv('SMTP_PASSWORD'),
    'from_email' => 'noreply@didc.com',
    'from_name' => 'DIDC Contact Form',
    'to_email' => 'hello@didc.com',
    'cc_emails' => [
        'ai-ml-consulting' => 'ai@didc.com',
        'enterprise-software' => 'software@didc.com',
        'digital-transformation' => 'transformation@didc.com',
        'cloud-services' => 'cloud@didc.com',
        'data-analytics' => 'analytics@didc.com',
        'cybersecurity' => 'security@didc.com',
        'partnership' => 'partnerships@didc.com',
        'careers' => 'careers@didc.com',
        'media' => 'press@didc.com'
    ],
    'hubspot_api_key' => getenv('HUBSPOT_API_KEY'),
    'slack_webhook' => getenv('SLACK_WEBHOOK_URL'),
    'upload_dir' => __DIR__ . '/uploads/',
    'max_file_size' => 10 * 1024 * 1024, // 10MB
    'allowed_extensions' => ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png']
];

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email address
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number
 */
function validatePhone($phone) {
    return preg_match('/^[\+]?[0-9\s\-\(\)]{10,}$/', $phone);
}

/**
 * Check for spam (honeypot and simple heuristics)
 */
function isSpam($data) {
    // Honeypot check
    if (!empty($data['website'])) {
        return true;
    }
    
    // Check for common spam patterns
    $spam_patterns = [
        '/\b(viagra|cialis|casino|poker|loan|mortgage)\b/i',
        '/\b(make money|work from home|get paid)\b/i',
        '/\b(click here|visit now|act now)\b/i'
    ];
    
    $text = $data['firstName'] . ' ' . $data['lastName'] . ' ' . $data['company'] . ' ' . $data['message'];
    
    foreach ($spam_patterns as $pattern) {
        if (preg_match($pattern, $text)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Handle file uploads
 */
function handleFileUploads($files, $config) {
    $uploaded_files = [];
    
    if (empty($files['files']['name'][0])) {
        return $uploaded_files;
    }
    
    // Create upload directory if it doesn't exist
    if (!is_dir($config['upload_dir'])) {
        mkdir($config['upload_dir'], 0755, true);
    }
    
    for ($i = 0; $i < count($files['files']['name']); $i++) {
        $filename = $files['files']['name'][$i];
        $tmp_name = $files['files']['tmp_name'][$i];
        $size = $files['files']['size'][$i];
        $error = $files['files']['error'][$i];
        
        if ($error !== UPLOAD_ERR_OK) {
            continue;
        }
        
        // Validate file size
        if ($size > $config['max_file_size']) {
            continue;
        }
        
        // Validate file extension
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!in_array($extension, $config['allowed_extensions'])) {
            continue;
        }
        
        // Generate unique filename
        $unique_filename = uniqid() . '_' . time() . '.' . $extension;
        $upload_path = $config['upload_dir'] . $unique_filename;
        
        // Scan for viruses (if ClamAV is available)
        if (function_exists('cl_scanfile')) {
            $scan_result = cl_scanfile($tmp_name);
            if ($scan_result !== CL_CLEAN) {
                continue;
            }
        }
        
        if (move_uploaded_file($tmp_name, $upload_path)) {
            $uploaded_files[] = [
                'original_name' => $filename,
                'uploaded_name' => $unique_filename,
                'path' => $upload_path,
                'size' => $size
            ];
        }
    }
    
    return $uploaded_files;
}

/**
 * Send email notification
 */
function sendEmail($data, $uploaded_files, $config) {
    // Determine CC email based on purpose
    $cc_email = isset($config['cc_emails'][$data['purpose']]) 
        ? $config['cc_emails'][$data['purpose']] 
        : null;
    
    // Email content
    $subject = "New Contact Form Submission - {$data['purpose']}";
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2563eb; }
            .value { margin-left: 10px; }
            .files { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>Name:</span>
                <span class='value'>{$data['firstName']} {$data['lastName']}</span>
            </div>
            <div class='field'>
                <span class='label'>Email:</span>
                <span class='value'>{$data['email']}</span>
            </div>
            <div class='field'>
                <span class='label'>Company:</span>
                <span class='value'>{$data['company']}</span>
            </div>
            <div class='field'>
                <span class='label'>Job Title:</span>
                <span class='value'>" . ($data['jobTitle'] ?: 'Not provided') . "</span>
            </div>
            <div class='field'>
                <span class='label'>Phone:</span>
                <span class='value'>" . ($data['phone'] ?: 'Not provided') . "</span>
            </div>
            <div class='field'>
                <span class='label'>Country:</span>
                <span class='value'>{$data['country']}</span>
            </div>
            <div class='field'>
                <span class='label'>Purpose:</span>
                <span class='value'>{$data['purpose']}</span>
            </div>
            <div class='field'>
                <span class='label'>Budget:</span>
                <span class='value'>" . ($data['budget'] ?: 'Not specified') . "</span>
            </div>
            <div class='field'>
                <span class='label'>Timeline:</span>
                <span class='value'>" . ($data['timeline'] ?: 'Not specified') . "</span>
            </div>
            <div class='field'>
                <span class='label'>Message:</span>
                <div class='value'>" . nl2br(htmlspecialchars($data['message'])) . "</div>
            </div>";
    
    if (!empty($uploaded_files)) {
        $message .= "<div class='files'><strong>Uploaded Files:</strong><ul>";
        foreach ($uploaded_files as $file) {
            $size_mb = round($file['size'] / 1024 / 1024, 2);
            $message .= "<li>{$file['original_name']} ({$size_mb} MB)</li>";
        }
        $message .= "</ul></div>";
    }
    
    $message .= "
            <div class='field'>
                <span class='label'>Submitted:</span>
                <span class='value'>{$data['timestamp']}</span>
            </div>
            <div class='field'>
                <span class='label'>IP Address:</span>
                <span class='value'>{$_SERVER['REMOTE_ADDR']}</span>
            </div>
        </div>
    </body>
    </html>";
    
    // Headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: {$config['from_name']} <{$config['from_email']}>",
        "Reply-To: {$data['firstName']} {$data['lastName']} <{$data['email']}>"
    ];
    
    if ($cc_email) {
        $headers[] = "Cc: {$cc_email}";
    }
    
    // Send email
    return mail($config['to_email'], $subject, $message, implode("\r\n", $headers));
}

/**
 * Send auto-reply email
 */
function sendAutoReply($data, $config) {
    $subject = "Thank you for contacting DIDC - We'll be in touch soon";
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .cta { background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .btn { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>Thank You for Contacting DIDC</h2>
        </div>
        <div class='content'>
            <p>Dear {$data['firstName']},</p>
            
            <p>Thank you for reaching out to DIDC regarding <strong>{$data['purpose']}</strong>. We've received your message and appreciate your interest in our AI-powered enterprise solutions.</p>
            
            <p><strong>What happens next:</strong></p>
            <ul>
                <li>A member of our team will review your inquiry within 24 hours</li>
                <li>You'll receive a follow-up email or call to discuss your requirements</li>
                <li>We'll prepare a customized solution proposal for your needs</li>
            </ul>
            
            <div class='cta'>
                <p>While you wait, explore our resources:</p>
                <a href='https://didc.com/case-studies.html' class='btn'>View Case Studies</a>
                <a href='https://didc.com/blog.html' class='btn'>Read Insights</a>
            </div>
            
            <p>If you have any urgent questions, feel free to contact us directly at:</p>
            <ul>
                <li>Phone: +1 (555) DIDC-AI</li>
                <li>Email: hello@didc.com</li>
                <li>Emergency: +1 (555) DIDC-911</li>
            </ul>
            
            <p>Best regards,<br>
            The DIDC Team</p>
        </div>
    </body>
    </html>";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: {$config['from_name']} <{$config['from_email']}>",
        "Reply-To: {$config['from_email']}"
    ];
    
    return mail($data['email'], $subject, $message, implode("\r\n", $headers));
}

/**
 * Send Slack notification
 */
function sendSlackNotification($data, $config) {
    if (empty($config['slack_webhook'])) {
        return false;
    }
    
    $payload = [
        'text' => 'New Contact Form Submission',
        'attachments' => [
            [
                'color' => 'good',
                'fields' => [
                    ['title' => 'Name', 'value' => "{$data['firstName']} {$data['lastName']}", 'short' => true],
                    ['title' => 'Company', 'value' => $data['company'], 'short' => true],
                    ['title' => 'Email', 'value' => $data['email'], 'short' => true],
                    ['title' => 'Purpose', 'value' => $data['purpose'], 'short' => true],
                    ['title' => 'Country', 'value' => $data['country'], 'short' => true],
                    ['title' => 'Budget', 'value' => $data['budget'] ?: 'Not specified', 'short' => true]
                ]
            ]
        ]
    ];
    
    $ch = curl_init($config['slack_webhook']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    return $result !== false;
}

/**
 * Integrate with HubSpot CRM
 */
function integrateWithHubSpot($data, $config) {
    if (empty($config['hubspot_api_key'])) {
        return false;
    }
    
    $contact_data = [
        'properties' => [
            'email' => $data['email'],
            'firstname' => $data['firstName'],
            'lastname' => $data['lastName'],
            'company' => $data['company'],
            'jobtitle' => $data['jobTitle'],
            'phone' => $data['phone'],
            'country' => $data['country'],
            'hs_lead_status' => 'NEW',
            'lifecyclestage' => 'lead'
        ]
    ];
    
    $ch = curl_init('https://api.hubapi.com/crm/v3/objects/contacts');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($contact_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "Authorization: Bearer {$config['hubspot_api_key']}"
    ]);
    
    $result = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $http_code === 201 || $http_code === 200;
}

// Main processing
try {
    // Collect and sanitize form data
    $data = [
        'firstName' => sanitizeInput($_POST['firstName'] ?? ''),
        'lastName' => sanitizeInput($_POST['lastName'] ?? ''),
        'email' => sanitizeInput($_POST['email'] ?? ''),
        'company' => sanitizeInput($_POST['company'] ?? ''),
        'jobTitle' => sanitizeInput($_POST['jobTitle'] ?? ''),
        'phone' => sanitizeInput($_POST['phone'] ?? ''),
        'country' => sanitizeInput($_POST['country'] ?? ''),
        'purpose' => sanitizeInput($_POST['purpose'] ?? ''),
        'budget' => sanitizeInput($_POST['budget'] ?? ''),
        'timeline' => sanitizeInput($_POST['timeline'] ?? ''),
        'message' => sanitizeInput($_POST['message'] ?? ''),
        'consent' => isset($_POST['consent']),
        'newsletter' => isset($_POST['newsletter']),
        'website' => sanitizeInput($_POST['website'] ?? ''), // Honeypot
        'timestamp' => $_POST['timestamp'] ?? date('Y-m-d H:i:s'),
        'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'referrer' => $_POST['referrer'] ?? ''
    ];
    
    // Validation
    $errors = [];
    
    if (empty($data['firstName'])) $errors[] = 'First name is required';
    if (empty($data['lastName'])) $errors[] = 'Last name is required';
    if (empty($data['email']) || !validateEmail($data['email'])) $errors[] = 'Valid email is required';
    if (empty($data['company'])) $errors[] = 'Company is required';
    if (empty($data['country'])) $errors[] = 'Country is required';
    if (empty($data['purpose'])) $errors[] = 'Purpose is required';
    if (empty($data['message'])) $errors[] = 'Message is required';
    if (!$data['consent']) $errors[] = 'Consent is required';
    
    if (!empty($data['phone']) && !validatePhone($data['phone'])) {
        $errors[] = 'Invalid phone number format';
    }
    
    // Spam check
    if (isSpam($data)) {
        http_response_code(400);
        exit('Submission rejected');
    }
    
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['errors' => $errors]);
        exit;
    }
    
    // Handle file uploads
    $uploaded_files = handleFileUploads($_FILES, $config);
    
    // Send notifications
    $email_sent = sendEmail($data, $uploaded_files, $config);
    $auto_reply_sent = sendAutoReply($data, $config);
    
    // Send Slack notification
    sendSlackNotification($data, $config);
    
    // Integrate with CRM
    integrateWithHubSpot($data, $config);
    
    // Set rate limit
    $_SESSION[$rate_limit_key] = $time;
    
    // Log submission (optional)
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'email' => $data['email'],
        'company' => $data['company'],
        'purpose' => $data['purpose'],
        'success' => $email_sent
    ];
    
    file_put_contents(
        __DIR__ . '/logs/contact_submissions.log',
        json_encode($log_entry) . "\n",
        FILE_APPEND | LOCK_EX
    );
    
    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your submission. We will contact you within 24 hours.',
        'email_sent' => $email_sent,
        'auto_reply_sent' => $auto_reply_sent
    ]);
    
} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred. Please try again later.']);
}
?>
