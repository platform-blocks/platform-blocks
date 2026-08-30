#!/bin/bash

# Simple sitemap generator for React UI Library docs
# This generates a basic sitemap.xml file for better SEO

BASE_URL="https://react-ui-library.com"
SITEMAP_FILE="public/sitemap.xml"

echo "Generating sitemap.xml..."

cat > $SITEMAP_FILE << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://react-ui-library.com/</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Components List -->
  <url>
    <loc>https://react-ui-library.com/components</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Individual Components -->
  <url>
    <loc>https://react-ui-library.com/components/Accordion</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Notice</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Button</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Card</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Chip</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Dialog</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Divider</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Icon</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components/Text</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Concepts -->
  <url>
    <loc>https://react-ui-library.com/concepts</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Examples -->
  <url>
    <loc>https://react-ui-library.com/examples</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Category pages -->
  <url>
    <loc>https://react-ui-library.com/components?category=Input</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components?category=Display</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components?category=Layout</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://react-ui-library.com/components?category=Feedback</loc>
    <lastmod>2025-08-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
EOF

echo "Sitemap generated at $SITEMAP_FILE"
