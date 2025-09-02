#!/bin/bash

# Script to apply component system to all internal HTML pages
# This script updates services/, careers/, industries/, products/, and blog/ subdirectories

SRC_DIR="/workspaces/ddc/bootstrap-website/src"

# Internal directories to process
SUBDIRS=(
    "services"
    "careers" 
    "industries"
    "products"
    "blog"
)

echo "🚀 Applying component system to internal pages..."

for subdir in "${SUBDIRS[@]}"; do
    if [ -d "$SRC_DIR/$subdir" ]; then
        echo "📁 Processing $subdir/ directory..."
        
        # Find all HTML files in the subdirectory
        find "$SRC_DIR/$subdir" -name "*.html" -type f | while read -r file; do
            echo "  🔧 Processing $(basename "$file")..."
            
            # Add CSS links if not present
            if ! grep -q "ddc-brand-theme.css" "$file"; then
                sed -i 's|<link rel="stylesheet" href="../css/modern-styles.css">|<link rel="stylesheet" href="../css/modern-styles.css">\n    <link rel="stylesheet" href="../css/ddc-brand-theme.css">\n    <link rel="stylesheet" href="../css/header-fix.css">|' "$file"
                echo "    ✅ Added CSS links"
            fi
            
            # Replace navigation with header container
            if grep -q "<!-- Navigation -->" "$file"; then
                # Create a temporary file for complex replacement
                awk '
                /<!-- Navigation -->/ {
                    print "    <!-- Header Container -->"
                    print "    <div id=\"header-container\"></div>"
                    in_nav = 1
                    next
                }
                /<\/nav>/ && in_nav {
                    in_nav = 0
                    next
                }
                !in_nav { print }
                ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
                echo "    ✅ Replaced navigation with header container"
            fi
            
            # Replace footer with footer container
            if grep -q "<!-- Footer -->" "$file"; then
                awk '
                /<!-- Footer -->/ {
                    print "    <!-- Footer Container -->"
                    print "    <div id=\"footer-container\"></div>"
                    in_footer = 1
                    next
                }
                /<\/footer>/ && in_footer {
                    in_footer = 0
                    next
                }
                !in_footer { print }
                ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
                echo "    ✅ Replaced footer with footer container"
            fi
            
            # Update scripts section
            if ! grep -q "components.js" "$file"; then
                sed -i 's|</body>|    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>\n    <script src="../js/components.js"></script>\n    <script src="../js/main.js"></script>\n</body>|' "$file"
                echo "    ✅ Updated scripts section"
            fi
        done
        
        echo "  ✅ Completed $subdir/ directory"
    else
        echo "  ⚠ $subdir/ directory not found, skipping..."
    fi
done

echo ""
echo "🎉 Component system application completed for all internal pages!"
echo "📊 Summary:"
echo "   - Updated navigation to use header container"
echo "   - Updated footer to use footer container" 
echo "   - Added red theme CSS files"
echo "   - Updated JavaScript includes"
echo ""
echo "🌐 Test the pages at:"
echo "   - http://127.0.0.1:45081/services/ai-ml.html"
echo "   - http://127.0.0.1:45081/careers/senior-software-engineer.html"
echo "   - http://127.0.0.1:45081/industries/finance.html"
echo "   - And other internal pages..."
