#!/bin/bash

# Script to apply component system to all HTML pages
# This script adds the necessary CSS links and replaces navigation/footer with component containers

PAGES=(
    "contact.html"
    "services.html" 
    "careers.html"
    "blog.html"
    "case-studies.html"
    "industries.html"
    "products.html"
    "privacy.html"
    "terms.html"
    "cookies.html"
)

SRC_DIR="/workspaces/ddc/bootstrap-website/src"

echo "Applying component system to pages..."

for page in "${PAGES[@]}"; do
    if [ -f "$SRC_DIR/$page" ]; then
        echo "Processing $page..."
        
        # Check if the file already has the component CSS
        if ! grep -q "ddc-brand-theme.css" "$SRC_DIR/$page"; then
            # Add CSS links after modern-styles.css
            sed -i 's|<link rel="stylesheet" href="css/modern-styles.css">|<link rel="stylesheet" href="css/modern-styles.css">\n    <link rel="stylesheet" href="css/ddc-brand-theme.css">\n    <link rel="stylesheet" href="css/header-fix.css">|' "$SRC_DIR/$page"
            echo "  ✓ Added CSS links to $page"
        fi
        
        # Replace navigation with header container (this is a simplified approach)
        # In a real scenario, you'd need more sophisticated parsing
        
        # Add components.js script if not present
        if ! grep -q "components.js" "$SRC_DIR/$page"; then
            # Add before closing body tag
            sed -i 's|</body>|    <script src="js/components.js"></script>\n</body>|' "$SRC_DIR/$page"
            echo "  ✓ Added components.js to $page"
        fi
    else
        echo "  ⚠ $page not found, skipping..."
    fi
done

echo "Component system application completed!"
echo "Note: Navigation and footer sections need manual replacement for complex structures."
