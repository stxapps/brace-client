#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error.
set -u
# The return value of a pipeline is the status of the last command
#   to exit with a non-zero status.
set -o pipefail

# --- Environment Configuration ---
readonly S3_BUCKET="s3://test-brace-web"
readonly CLOUDFRONT_DISTRIBUTION_ID="E1IMMCHCDM4Y81"
readonly SOURCE_DIR="out"

# --- Cache-Control Headers ---
readonly CACHE_IMMUTABLE="max-age=31536000, public, immutable"
readonly CACHE_YEAR="max-age=31536000"
readonly CACHE_WEEK="max-age=604800"
readonly CACHE_NONE="no-cache"

echo "Starting deployment to ${S3_BUCKET}..."

# Sync versioned assets in _next and static folder.
# These files have content hashes in their names, so they can be cached "forever".
# Don't --delete on _next as users might be on old version and still navigate.
echo "Syncing _next and static assets with immutable caching..."
aws s3 sync "${SOURCE_DIR}/_next" "${S3_BUCKET}/_next" \
    --size-only \
    --acl public-read \
    --cache-control "${CACHE_IMMUTABLE}"

aws s3 sync "${SOURCE_DIR}/static" "${S3_BUCKET}/static" \
    --delete \
    --size-only \
    --acl public-read \
    --cache-control "${CACHE_IMMUTABLE}"

# Sync images folders.
# WARNING: These assets are cached for one year. If their contents change without their
#   filenames changing, users may receive stale content. Ensure these are versioned.
echo "Syncing image assets with 1-year caching..."
aws s3 sync "${SOURCE_DIR}/images" "${S3_BUCKET}/images" \
    --delete \
    --size-only \
    --acl public-read \
    --cache-control "${CACHE_YEAR}"

# Sync .well-known directory. No cache-control is set, relying on S3/CloudFront defaults.
echo "Syncing .well-known assets..."
aws s3 sync "${SOURCE_DIR}/.well-known" "${S3_BUCKET}/.well-known" \
    --delete \
    --size-only \
    --acl public-read \
    --content-type "application/json"

# Sync specific root files (icons, social images) with a 1-week cache.
readonly cachedItems=(
    "apple-icon.png" "apple-touch-icon.png" "icon1.png" "icon2.png"
    "logo16.png" "logo32.png" "logo48.png" "logo64.png" "logo192.png"
    "logo192-maskable.png" "logo512.png" "logo512-maskable.png"
    "logo-for-stacks-access.png" "ss-mobile-1.png" "ss-mobile-2.png"
    "ss-mobile-3.png" "ss-mobile-4.png" "ss-wide-1.png" "ss-wide-2.png"
    "ss-wide-3.png" "ss-wide-4.png" "twitter-card-image-pattern2.png"
    "twitter-card-image-pattern5.png"
)
echo "Syncing root assets with 1-week caching..."
aws s3 sync "${SOURCE_DIR}" "${S3_BUCKET}" \
    --exclude "*" \
    "${cachedItems[@]/#/--include=}" \
    --delete \
    --size-only \
    --acl public-read \
    --cache-control "${CACHE_WEEK}"

# Copy service worker files.
# These should not be cached by browsers to ensure updates are picked up.
echo "Copying service worker files with no-cache..."
aws s3 cp "${SOURCE_DIR}/service-worker.js" "${S3_BUCKET}/service-worker.js" --acl public-read --cache-control "${CACHE_NONE}"
aws s3 cp "${SOURCE_DIR}/sw.js" "${S3_BUCKET}/sw.js" --acl public-read --cache-control "${CACHE_NONE}"

# Sync remaining root files (HTML pages, manifests, etc.) with no-cache.
# This ensures users always get the latest HTML pointing to the latest assets.
# Don't --size-only as size may be the same, but content changes.
echo "Syncing remaining root assets with no-cache..."
aws s3 sync "${SOURCE_DIR}" "${S3_BUCKET}" \
    --exclude "_next/*" \
    --exclude "static/*" \
    --exclude "images/*" \
    --exclude ".well-known/*" \
    "${cachedItems[@]/#/--exclude=}" \
    --exclude "service-worker.js" \
    --exclude "sw.js" \
    --delete \
    --acl public-read \
    --cache-control "${CACHE_NONE}"

# Invalidate the CloudFront cache to make sure all changes are live.
# Invalidating "/*" is a broad approach but ensures all changes are picked up.
echo "Creating CloudFront invalidation for all paths..."
aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" --paths "/*"

echo "Deployment finished successfully."
