/**
 * This function handles viewer requests for a hybrid site
 *   that supports clean page URLs and bookmarking via path.
 * 1. Redirects www to non-www.
 * 2. Pass through the root path.
 * 3. Pass through paths with dots:
 *    - This handles /favicon.ico, /example.com, /example.com/some/path, etc.
 *    - BUG ALERT: No support directory names with a dot!
 * 4. For page paths (no dot in URI) e.g., /support or /support/:
 *    - Redirects paths with a trailing slash to the non-slash version.
 *    - Rewrites clean paths to their .html equivalent.
 *
 * @param {AWSCloudFrontFunction.Event} event - The CloudFront event object.
 * @returns {AWSCloudFrontFunction.Request | AWSCloudFrontFunction.Response}
 */
function handler(event) {
  const request = event.request;
  const host = request.headers.host.value;
  const uri = request.uri;

  // 1. Redirect www to non-www.
  if (host.startsWith('www.')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: `https://${host.slice(4)}${uri}` },
      },
    };
  }

  // 2. Pass through the root path.
  if (uri === '' || uri === '/') return request;

  // 3. Pass through paths with dots.
  if (uri.includes('.')) return request;

  // 4. Handle page paths (no dots in URI).
  if (uri.endsWith('/')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.slice(0, -1) },
      },
    };
  }

  request.uri += '.html';
  return request;
}
