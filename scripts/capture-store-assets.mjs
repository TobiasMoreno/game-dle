import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const webRoot = join(projectRoot, "dist", "game-dle-mobile", "browser");
const storeRoot = join(projectRoot, "store", "assets");
const featureGraphic = join(storeRoot, "google-play", "feature-graphic.svg");

if (!existsSync(join(webRoot, "index.html"))) {
  throw new Error(
    "Falta el build móvil. Ejecutá npm run build:mobile antes de capturar assets."
  );
}

const chrome = findChrome();
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: [
    "--disable-background-networking",
    "--disable-component-update",
    "--host-resolver-rules=MAP store.gamedle.local 127.0.0.1",
  ],
});
const server = createServer((request, response) => serve(request, response));
await new Promise((resolveServer, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolveServer);
});

const { port } = server.address();
const baseUrl = `http://store.gamedle.local:${port}`;
const captures = [
  { route: "/", name: "01-inicio" },
  { route: "/games/wordle", name: "02-wordle" },
  { route: "/games/chronodle", name: "03-chronodle" },
];

try {
  for (const capture of captures) {
    await takeScreenshot({
      url: `${baseUrl}${capture.route}`,
      output: join(
        storeRoot,
        "app-store",
        "iphone-6.9",
        "es-AR",
        `${capture.name}.png`
      ),
      width: 430,
      height: 932,
      scale: 3,
    });
    await takeScreenshot({
      url: `${baseUrl}${capture.route}`,
      output: join(
        storeRoot,
        "google-play",
        "phone",
        "es-AR",
        `${capture.name}.png`
      ),
      width: 360,
      height: 640,
      scale: 3,
    });
    await takeScreenshot({
      url: `${baseUrl}${capture.route}`,
      output: join(
        storeRoot,
        "app-store",
        "ipad-13",
        "es-AR",
        `${capture.name}.png`
      ),
      width: 1024,
      height: 1366,
      scale: 2,
    });
  }
  await takeScreenshot({
    url: `${baseUrl}/__store/feature-graphic.svg`,
    output: join(storeRoot, "google-play", "feature-graphic.png"),
    width: 1024,
    height: 500,
    scale: 1,
    isMobile: false,
  });
} finally {
  await browser.close();
  await new Promise((resolveServer) => server.close(resolveServer));
}

console.log("Capturas y feature graphic actualizados en store/assets/.");

async function takeScreenshot({
  url,
  output,
  width,
  height,
  scale,
  isMobile = true,
}) {
  mkdirSync(dirname(output), { recursive: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    isMobile,
    hasTouch: isMobile,
    locale: "es-AR",
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 });
    await page.waitForTimeout(2_000);
    await page.screenshot({
      path: output,
      fullPage: false,
      animations: "disabled",
    });
  } finally {
    await context.close();
  }
  if (!existsSync(output) || statSync(output).size === 0) {
    throw new Error(`No se pudo capturar ${url}`);
  }
}

function serve(request, response) {
  const pathname = decodeURIComponent(
    new URL(request.url, "http://localhost").pathname
  );
  if (pathname === "/__store/feature-graphic.svg") {
    return sendFile(featureGraphic, response, "image/svg+xml");
  }

  const requestedPath = normalize(join(webRoot, pathname));
  if (
    requestedPath.startsWith(webRoot) &&
    existsSync(requestedPath) &&
    statSync(requestedPath).isFile()
  ) {
    return sendFile(requestedPath, response);
  }
  return sendFile(
    join(webRoot, "index.html"),
    response,
    "text/html; charset=utf-8"
  );
}

function sendFile(path, response, explicitType) {
  if (!existsSync(path)) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": explicitType ?? contentType(path),
    "Cache-Control": "no-store",
  });
  createReadStream(path).pipe(response);
}

function contentType(path) {
  return (
    {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".ico": "image/x-icon",
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".mp3": "audio/mpeg",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
    }[extname(path).toLowerCase()] ?? "application/octet-stream"
  );
}

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    process.platform === "win32" &&
      join(
        process.env.PROGRAMFILES ?? "",
        "Google",
        "Chrome",
        "Application",
        "chrome.exe"
      ),
    process.platform === "win32" &&
      join(
        process.env["PROGRAMFILES(X86)"] ?? "",
        "Google",
        "Chrome",
        "Application",
        "chrome.exe"
      ),
    process.platform === "win32" &&
      join(
        process.env.LOCALAPPDATA ?? "",
        "Google",
        "Chrome",
        "Application",
        "chrome.exe"
      ),
    process.platform === "darwin" &&
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    process.platform === "linux" && "/usr/bin/google-chrome",
    process.platform === "linux" && "/usr/bin/chromium",
  ].filter(Boolean);
  const executable = candidates.find((candidate) => existsSync(candidate));
  if (!executable) {
    throw new Error(
      "No se encontró Chrome. Definí CHROME_BIN para generar los assets de stores."
    );
  }
  return executable;
}
