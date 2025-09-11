/**
 * This function handles viewer requests for a hybrid MPA/SPA site.
 * 1. Redirects www to non-www.
 * 2. Pass through the root path.
 * 3. Pass through asset paths
 * 4. Redirects clean paths with trailing slashes to their canonical non-slash version.
 * 5. Rewrites clean paths with no dots with .html.
 * 6. Rewrites paths with a valid url format to /404.html.
 * 7. Redirects paths with trailing slashes to their canonical non-slash version.
 * 8. Pass through paths with dot.
 * 9. Rewrites no-dot paths with .html.
 *
 * @param {AWSCloudFrontFunction.Event} event - The CloudFront event object.
 * @returns {AWSCloudFrontFunction.Request | AWSCloudFrontFunction.Response}
 */
function handler(event) {
  const request = event.request;
  const uri = request.uri;

  // 1.
  if (request.headers.host.value === 'www.brace.to') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: `https://brace.to${uri}` },
      },
    };
  }

  // 2.
  if (uri === '' || uri === '/') return request;

  // 3.
  let urlPattern = /^\/(.+\/)*.+\..+$/;
  if (urlPattern.test(uri)) return request;

  // 4.
  urlPattern = /^\/(\w+\/)*\w+\/+$/;
  if (urlPattern.test(uri)) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.slice(0, -1) },
      },
    };
  }

  // 5.
  urlPattern = /^\/(\w+\/)*\w+$/;
  if (urlPattern.test(uri)) {
    request.uri += '.html';
    return request;
  }

  // 6.
  urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]{1,256}\.)+[a-zA-Z]{2,8}/;
  if (urlPattern.test(uri)) {
    request.uri = '/404.html';
    return request;
  }

  // 7.
  if (uri.length > 1 && uri.endsWith('/')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.slice(0, -1) },
      },
    };
  }

  // 8.
  if (uri.includes('.')) return request;

  // 9.
  request.uri += '.html';
  return request;
}
