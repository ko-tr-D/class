import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function setNoCacheHeaders(response) {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  response.setHeader("Surrogate-Control", "no-store");
}

function resolvePath(url) {
  const requested = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const normalized = normalize(requested === "/" ? "/index.html" : requested);
  const absolute = join(root, normalized);
  return absolute.startsWith(root) ? absolute : join(root, "index.html");
}

createServer((request, response) => {
  setNoCacheHeaders(response);
  if (new URL(request.url, `http://localhost:${port}`).pathname === "/__reset-preview") {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(`<!doctype html>
<html lang="ko">
  <meta charset="UTF-8" />
  <body>
    <script>
      localStorage.removeItem("class-learning-record-api");
      localStorage.removeItem("class-learning-record-state-v1");
      location.replace("/");
    </script>
  </body>
</html>`);
    return;
  }
  const filePath = resolvePath(request.url);
  const servedPath = existsSync(filePath) ? filePath : join(root, "index.html");
  response.setHeader("Content-Type", contentTypes[extname(servedPath)] || "application/octet-stream");
  createReadStream(servedPath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Preview server running at http://127.0.0.1:${port}`);
});
