import { buffer } from 'node:stream/consumers';
import server from '../dist/server/server.js';

function createHeaders(requestHeaders: Record<string, string | string[] | undefined>) {
  const headers = new Headers();

  for (const [name, value] of Object.entries(requestHeaders)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(name, v);
    } else {
      headers.append(name, value);
    }
  }

  return headers;
}

async function createRequest(req: RequestInfo & { url?: string; method?: string; headers?: any; }) {
  const url = new URL(req.url ?? '', `https://${req.headers?.host ?? 'localhost'}`);
  const body = req.method && req.method !== 'GET' && req.method !== 'HEAD'
    ? await buffer(req as any)
    : undefined;

  return new Request(url, {
    method: req.method,
    headers: createHeaders(req.headers),
    body: body?.length ? body : undefined,
  });
}

function sendResponse(res: any, response: Response) {
  res.statusCode = response.status;

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      res.setHeader(key, value);
    } else {
      res.setHeader(key, value);
    }
  });

  return response.arrayBuffer().then((buffer) => {
    res.end(Buffer.from(buffer));
  });
}

export default async function handler(req: any, res: any) {
  const request = await createRequest(req);
  const response = await server.fetch(request, process.env, undefined);
  await sendResponse(res, response);
}
