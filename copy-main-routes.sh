#!/bin/bash

# Create main directories
mkdir -p src/app/main_routes/about
mkdir -p "src/app/main_routes/auction/[slug]/bid"
mkdir -p src/app/main_routes/auction/how-it-works
mkdir -p src/app/main_routes/components
mkdir -p src/app/main_routes/contact
mkdir -p src/app/main_routes/faq
mkdir -p "src/app/main_routes/inventory/[slug]"
mkdir -p src/app/main_routes/process
mkdir -p src/app/main_routes/quote/auction-service
mkdir -p src/app/main_routes/quote/import-shipping
mkdir -p src/app/main_routes/quote/vehicle-search
mkdir -p src/app/main_routes/shipping

# Copy about files
cp "src/app/(main)/about/page.module.css" src/app/main_routes/about/
cp "src/app/(main)/about/page.tsx" src/app/main_routes/about/

# Copy auction files
cp "src/app/(main)/auction/page.module.css" src/app/main_routes/auction/
cp "src/app/(main)/auction/page.tsx" src/app/main_routes/auction/

# Copy auction/[slug] files
cp "src/app/(main)/auction/[slug]/page.module.css" "src/app/main_routes/auction/[slug]/"
cp "src/app/(main)/auction/[slug]/page.tsx" "src/app/main_routes/auction/[slug]/"

# Copy auction/[slug]/bid files
cp "src/app/(main)/auction/[slug]/bid/page.module.css" "src/app/main_routes/auction/[slug]/bid/"
cp "src/app/(main)/auction/[slug]/bid/page.tsx" "src/app/main_routes/auction/[slug]/bid/"

# Copy auction/how-it-works files
cp "src/app/(main)/auction/how-it-works/page.module.css" src/app/main_routes/auction/how-it-works/
cp "src/app/(main)/auction/how-it-works/page.tsx" src/app/main_routes/auction/how-it-works/

# Copy components files
cp "src/app/(main)/components/FAQSection.module.css" src/app/main_routes/components/
cp "src/app/(main)/components/FAQSection.tsx" src/app/main_routes/components/
cp "src/app/(main)/components/HeroSection.module.css" src/app/main_routes/components/
cp "src/app/(main)/components/HeroSection.tsx" src/app/main_routes/components/
cp "src/app/(main)/components/HowToPurchaseSection.module.css" src/app/main_routes/components/
cp "src/app/(main)/components/HowToPurchaseSection.tsx" src/app/main_routes/components/
cp "src/app/(main)/components/RecentlyAddedSection.module.css" src/app/main_routes/components/
cp "src/app/(main)/components/RecentlyAddedSection.tsx" src/app/main_routes/components/

# Copy contact files
cp "src/app/(main)/contact/page.module.css" src/app/main_routes/contact/
cp "src/app/(main)/contact/page.tsx" src/app/main_routes/contact/

# Copy faq files
cp "src/app/(main)/faq/page.module.css" src/app/main_routes/faq/
cp "src/app/(main)/faq/page.tsx" src/app/main_routes/faq/

# Copy inventory files
cp "src/app/(main)/inventory/inventory.module.css" src/app/main_routes/inventory/
cp "src/app/(main)/inventory/page.tsx" src/app/main_routes/inventory/

# Copy inventory/[slug] files
cp "src/app/(main)/inventory/[slug]/page.module.css" "src/app/main_routes/inventory/[slug]/"
cp "src/app/(main)/inventory/[slug]/page.tsx" "src/app/main_routes/inventory/[slug]/"

# Copy process files
cp "src/app/(main)/process/globals.css" src/app/main_routes/process/
cp "src/app/(main)/process/page.module.css" src/app/main_routes/process/
cp "src/app/(main)/process/page.tsx" src/app/main_routes/process/

# Copy quote files
cp "src/app/(main)/quote/page.module.css" src/app/main_routes/quote/
cp "src/app/(main)/quote/page.tsx" src/app/main_routes/quote/

# Copy quote/auction-service files
cp "src/app/(main)/quote/auction-service/page.module.css" src/app/main_routes/quote/auction-service/
cp "src/app/(main)/quote/auction-service/page.tsx" src/app/main_routes/quote/auction-service/

# Copy quote/import-shipping files
cp "src/app/(main)/quote/import-shipping/page.module.css" src/app/main_routes/quote/import-shipping/
cp "src/app/(main)/quote/import-shipping/page.tsx" src/app/main_routes/quote/import-shipping/

# Copy quote/vehicle-search files
cp "src/app/(main)/quote/vehicle-search/page.module.css" src/app/main_routes/quote/vehicle-search/
cp "src/app/(main)/quote/vehicle-search/page.tsx" src/app/main_routes/quote/vehicle-search/

# Copy shipping files
cp "src/app/(main)/shipping/page.module.css" src/app/main_routes/shipping/
cp "src/app/(main)/shipping/page.tsx" src/app/main_routes/shipping/

# Copy root files
cp "src/app/(main)/layout.tsx" src/app/main_routes/
cp "src/app/(main)/page.module.css" src/app/main_routes/
cp "src/app/(main)/page.tsx" src/app/main_routes/

echo "All files copied successfully!"
