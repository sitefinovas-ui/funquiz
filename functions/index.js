import { onRequest } from "firebase-functions/v2/https";

const readBody = async (req) => {
  if (req.method === "GET" || req.method === "HEAD") return undefined;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
};

const filterRequestHeaders = (headers) => {
  const out = {};
  for (const [k, v] of Object.entries(headers || {})) {
    const key = k.toLowerCase();
    if (key === "host") continue;
    if (key === "connection") continue;
    if (key === "content-length") continue;
    if (typeof v === "undefined") continue;
    out[key] = v;
  }
  return out;
};

const filterResponseHeaders = (headers) => {
  const out = {};
  for (const [k, v] of headers.entries()) {
    const key = k.toLowerCase();
    if (key === "transfer-encoding") continue;
    if (key === "connection") continue;
    out[key] = v;
  }
  return out;
};

export const api = onRequest(async (req, res) => {
  const backendOrigin =
    process.env.BACKEND_ORIGIN || "https://funquiz-production-8095.up.railway.app";
  if (!backendOrigin) {
    res.status(500).json({
      error: "BACKEND_ORIGIN manquant",
      hint: "Définis BACKEND_ORIGIN (ex: https://<ton-backend>.up.railway.app)",
    });
    return;
  }

  const targetUrl = `${backendOrigin.replace(/\/+$/, "")}${req.originalUrl}`;

  const body = await readBody(req);
  const headers = filterRequestHeaders(req.headers);
  headers["x-forwarded-host"] = req.get("host") || "";
  headers["x-forwarded-proto"] = req.get("x-forwarded-proto") || req.protocol || "https";

  let upstream;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (e) {
    res.status(502).json({ error: "Proxy upstream failed" });
    return;
  }

  const responseHeaders = filterResponseHeaders(upstream.headers);
  Object.entries(responseHeaders).forEach(([k, v]) => res.setHeader(k, v));
  res.status(upstream.status);

  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
});
