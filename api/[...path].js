/**
 * Vercel Serverless Function Catch-all API Proxy (Root Level)
 * Handles /api/* requests:
 * 1. Injects server-side IVY_API_KEY
 * 2. Forwards client Authorization header
 * 3. Maps /v1/favourites to /v1/saved
 * 4. Proxies request to upstream Ivy API without exposing credentials
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  const BASE_URL = process.env.IVY_BASE_URL || 'https://solve.ivy.homes';
  const API_KEY = process.env.IVY_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: IVY_API_KEY is not set' });
  }

  let subpath = '';
  if (Array.isArray(req.query?.path)) {
    subpath = '/' + req.query.path.join('/');
  } else if (typeof req.query?.path === 'string') {
    subpath = '/' + req.query.path;
  } else {
    const parsed = new URL(req.url, 'http://localhost');
    subpath = parsed.pathname.replace(/^\/api/, '');
  }

  if (subpath.startsWith('/v1/favourites')) {
    subpath = subpath.replace('/v1/favourites', '/v1/saved');
  }

  const parsedUrl = new URL(req.url, 'http://localhost');
  const searchParams = new URLSearchParams(parsedUrl.search);
  searchParams.delete('path');
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const upstreamUrl = `${BASE_URL}${subpath}${queryString}`;

  const headers = {
    'X-API-Key': API_KEY,
  };

  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }

  const fetchOptions = {
    method: req.method,
    headers,
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    if (req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
  }

  try {
    const upstreamRes = await fetch(upstreamUrl, fetchOptions);
    const contentType = upstreamRes.headers.get('content-type') || '';

    res.status(upstreamRes.status);
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (contentType.includes('application/json')) {
      const data = await upstreamRes.json();
      return res.json(data);
    }

    const text = await upstreamRes.text();
    return res.send(text);
  } catch (error) {
    return res.status(502).json({
      error: 'Bad Gateway: unable to contact upstream Ivy API',
      message: error.message,
    });
  }
}

