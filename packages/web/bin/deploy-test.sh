#!/bin/bash

aws s3 sync build/static s3://test-brace-web/static --size-only --delete --acl public-read --cache-control max-age=31536000

aws s3 sync build/.well-known s3://test-brace-web/.well-known --size-only --delete --acl public-read --content-type application/json
#aws s3 cp build/.well-known/apple-app-site-association s3://test-brace-web/.well-known/apple-app-site-association --acl public-read --content-type application/json

# stackoverflow.com/questions/55045423/aws-cli-s3-sync-how-to-exclude-multiple-files
cachedItems=(logo16.png logo32.png logo48.png logo64.png logo192.png logo192-maskable.png logo512.png logo512-maskable.png logo-for-stacks-access.png ss-mobile-1.png ss-mobile-2.png ss-mobile-3.png ss-mobile-4.png ss-wide-1.png ss-wide-2.png ss-wide-3.png ss-wide-4.png twitter-card-image-pattern2.png twitter-card-image-pattern5.png)
aws s3 sync build s3://test-brace-web --exclude "*" "${cachedItems[@]/#/--include=}" --size-only --delete --acl public-read --cache-control max-age=604800

aws s3 sync build s3://test-brace-web --exclude "static/*" --exclude ".well-known/*" "${cachedItems[@]/#/--exclude=}" --exclude service-worker.js --exclude index.html --size-only --delete --acl public-read

aws s3 cp build/service-worker.js s3://test-brace-web/service-worker.js --acl public-read --cache-control no-cache
aws s3 cp build/index.html s3://test-brace-web/index.html --acl public-read --cache-control no-cache

aws cloudfront create-invalidation --distribution-id E1IMMCHCDM4Y81 --paths /index.html
#aws cloudfront create-invalidation --distribution-id E1IMMCHCDM4Y81 --paths /index.html "/.well-known/*"
