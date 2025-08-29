# DIDC Corporate Website

## 🚀 Overview

This is the official corporate website for **Deccan (India) Development Corporation (DIDC)**, built using Bootstrap 5, ES modules, and modern web standards. The website showcases DIDC's expertise in AI/ML solutions, software development, and IT consulting services.

## ✨ Features

- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Performance Optimized**: Cache-busted assets, minified CSS/JS
- **SEO Ready**: Complete meta tags, JSON-LD schema, sitemap
- **Accessibility**: WCAG 2.1 AA compliant
- **Contact Form**: PHP backend with spam protection
- **Modern Architecture**: ES modules, CSS custom properties

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5.3.2
- **Backend**: PHP (contact form)
- **Build Tools**: Node.js, PostCSS, Terser
- **Fonts**: Google Fonts (Poppins, Inter)

## 📁 Project Structure

```
bootstrap-website/
├── src/                          # Source files
│   ├── css/
│   │   ├── brand-tokens.css      # DIDC brand variables
│   │   ├── bootstrap.min.css     # Bootstrap framework
│   │   ├── styles.css            # Custom styles
│   │   └── main.css              # Main stylesheet
│   ├── js/
│   │   ├── bootstrap.min.js      # Bootstrap JavaScript
│   │   └── main.js               # Custom JavaScript
│   ├── content/
│   │   ├── services.json         # Services data
│   │   └── industries.json       # Industries data
│   ├── assets/
│   │   └── images/               # Image assets
│   ├── index.html                # Homepage
│   ├── contact.html              # Contact page
│   ├── contact.php               # Contact form handler
│   ├── robots.txt                # SEO robots file
│   └── sitemap.xml               # SEO sitemap
├── scripts/
│   └── build-assets.js           # Build script
├── package.json                  # Dependencies
└── README.md
```

## 🚀 Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   # Opens http://localhost:3000
   ```

3. **Build for production**:
   ```bash
   npm run build
   # Creates optimized files in /dist
   ```

### Alternative Development Setup

If npm start doesn't work, you can use any local server:

```bash
# Python 3
cd src && python3 -m http.server 3000

# Node.js with npx
npx live-server src --port=3000

# VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

## 🎨 Brand Guidelines

### Colors
- **Primary Navy**: `#0B1C45` (var(--didc-navy))
- **Accent Red**: `#E63946` (var(--didc-crimson))
- **Text Dark**: `#111318` (var(--didc-ink))
- **Body Text**: `#2B2F36` (var(--didc-body))
- **Background**: `#FAFAF8` (var(--didc-bg))

### Typography
- **Headings**: Poppins (600, 700, 800)
- **Body**: Inter (400, 600)

### Design Principles
- Generous whitespace (80px section padding)
- 14px border radius
- Subtle shadows and hover effects
- Accessibility-first approach

## 📄 Page Structure

### Completed Pages
- ✅ **Homepage** (`index.html`) - Hero, services, case study, stats, blog preview
- ✅ **Contact** (`contact.html`) - Contact form with spam protection

### Pages to Create
- 🔲 About Us (`about.html`)
- 🔲 Services overview (`services.html`)
- 🔲 Service detail pages (`services/*.html`)
- 🔲 Products (`products.html`)
- 🔲 Industries (`industries.html`)
- 🔲 Case Studies (`case-studies.html`)
- 🔲 Careers (`careers.html`)
- 🔲 Blog (`blog.html`)
- 🔲 Privacy Policy (`privacy.html`)
- 🔲 Terms of Service (`terms.html`)

## 🔧 Contact Form Setup

The contact form uses PHP and requires:

1. **Server Requirements**:
   - PHP 7.4+
   - Mail function enabled

2. **Environment Variables** (optional):
   ```bash
   CONTACT_EMAIL=hello@didc.global
   ```

3. **Features**:
   - Honeypot spam protection
   - Rate limiting (5 submissions/hour)
   - Email validation
   - GDPR consent checkbox

## 🚀 Deployment

### Option 1: Static Hosting (Netlify/Vercel)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `/dist` folder

3. Configure redirects for contact form:
   ```
   /contact.php    /api/contact    200
   ```

### Option 2: cPanel/Shared Hosting

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload contents of `/dist` to `public_html/`

3. Ensure PHP is enabled for contact form

4. Configure email settings in contact.php

### Option 3: VPS/Dedicated Server

1. Build and upload files
2. Configure Apache/Nginx
3. Set up SSL certificate
4. Configure email server

## 📊 Performance Budget

Target metrics (Lighthouse):
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **TBT**: < 300ms
- **Performance Score**: > 90

## ♿ Accessibility Features

- WCAG 2.1 AA compliant
- Skip-to-content link
- Proper heading hierarchy
- ARIA labels and landmarks
- Focus management
- Color contrast > 4.5:1
- Reduced motion support

## 🔍 SEO Features

- Complete meta tags
- Open Graph and Twitter Cards
- JSON-LD structured data
- Sitemap.xml
- Robots.txt
- Semantic HTML structure
- Optimized images

## 🔐 Security Features

- XSS protection headers
- Content Security Policy ready
- Honeypot spam protection
- Rate limiting
- Input sanitization
- HTTPS redirect (in .htaccess)

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🤝 Contributing

1. Follow the existing code style
2. Test on multiple devices/browsers
3. Ensure accessibility compliance
4. Update documentation

## 📞 Support

For technical support or questions:
- **Email**: hello@didc.global
- **Website**: https://didc.global

## 📝 License

© 2024 Deccan (India) Development Corporation. All rights reserved.

---

**Built with ❤️ by the DIDC Team**