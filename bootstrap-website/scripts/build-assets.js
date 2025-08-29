#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Build script for DIDC website
 * - Creates cache-busted asset links
 * - Copies files to dist directory
 * - Generates production-ready HTML files
 */

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Create subdirectories
const dirs = ['assets/css', 'assets/js', 'assets/images', 'assets/favicons'];
dirs.forEach(dir => {
    const fullPath = path.join(distDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

/**
 * Generate hash for file content
 */
function generateHash(content) {
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Copy file with hash
 */
function copyWithHash(srcFile, destDir, filename) {
    const content = fs.readFileSync(srcFile);
    const hash = generateHash(content);
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const hashedFilename = `${name}.${hash}${ext}`;
    const destPath = path.join(destDir, hashedFilename);
    
    fs.writeFileSync(destPath, content);
    console.log(`✓ ${filename} → ${hashedFilename}`);
    
    return `/assets/${path.relative(path.join(distDir, 'assets'), destPath).replace(/\\/g, '/')}`;
}

/**
 * Process CSS files
 */
function processCSS() {
    console.log('\n📦 Processing CSS files...');
    
    const cssFiles = ['main.css', 'bootstrap.min.css'];
    const assetMap = {};
    
    cssFiles.forEach(file => {
        const srcPath = path.join(srcDir, 'css', file);
        if (fs.existsSync(srcPath)) {
            const hashedPath = copyWithHash(srcPath, path.join(distDir, 'assets/css'), file);
            assetMap[`/css/${file}`] = hashedPath;
        }
    });
    
    return assetMap;
}

/**
 * Process JavaScript files
 */
function processJS() {
    console.log('\n📦 Processing JavaScript files...');
    
    const jsFiles = ['main.js', 'bootstrap.min.js'];
    const assetMap = {};
    
    jsFiles.forEach(file => {
        const srcPath = path.join(srcDir, 'js', file);
        if (fs.existsSync(srcPath)) {
            const hashedPath = copyWithHash(srcPath, path.join(distDir, 'assets/js'), file);
            assetMap[`/js/${file}`] = hashedPath;
        }
    });
    
    return assetMap;
}

/**
 * Copy static assets
 */
function copyStaticAssets() {
    console.log('\n📦 Copying static assets...');
    
    // Copy robots.txt and sitemap.xml
    const staticFiles = ['robots.txt', 'sitemap.xml'];
    staticFiles.forEach(file => {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(distDir, file);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✓ ${file}`);
        }
    });
    
    // Copy contact.php
    const phpFile = path.join(srcDir, 'contact.php');
    if (fs.existsSync(phpFile)) {
        fs.copyFileSync(phpFile, path.join(distDir, 'contact.php'));
        console.log('✓ contact.php');
    }
}

/**
 * Process HTML files
 */
function processHTML(assetMap) {
    console.log('\n📦 Processing HTML files...');
    
    const htmlFiles = fs.readdirSync(srcDir).filter(file => file.endsWith('.html'));
    
    htmlFiles.forEach(file => {
        const srcPath = path.join(srcDir, file);
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Replace asset paths with hashed versions
        Object.entries(assetMap).forEach(([originalPath, hashedPath]) => {
            const regex = new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            content = content.replace(regex, hashedPath);
        });
        
        // Minify HTML (basic)
        content = content
            .replace(/\s+/g, ' ')                    // Collapse whitespace
            .replace(/>\s+</g, '><')                 // Remove whitespace between tags
            .replace(/<!--.*?-->/g, '')              // Remove comments
            .trim();
        
        const destPath = path.join(distDir, file);
        fs.writeFileSync(destPath, content);
        console.log(`✓ ${file}`);
    });
}

/**
 * Generate .htaccess for caching
 */
function generateHtaccess() {
    console.log('\n📦 Generating .htaccess...');
    
    const htaccess = `
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Leverage browser caching
<IfModule mod_expires.c>
    ExpiresActive on
    
    # Cache hashed assets for 1 year
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    
    # Cache HTML for 1 day
    ExpiresByType text/html "access plus 1 day"
    
    # Cache XML files for 1 day
    ExpiresByType application/xml "access plus 1 day"
    ExpiresByType text/xml "access plus 1 day"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
</IfModule>

# Redirect to HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
`.trim();
    
    fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess);
    console.log('✓ .htaccess');
}

/**
 * Main build function
 */
function build() {
    console.log('🚀 Starting DIDC website build...');
    
    const assetMap = {
        ...processCSS(),
        ...processJS()
    };
    
    copyStaticAssets();
    processHTML(assetMap);
    generateHtaccess();
    
    console.log('\n✅ Build completed successfully!');
    console.log(`📁 Output directory: ${distDir}`);
}

// Run build
build();
