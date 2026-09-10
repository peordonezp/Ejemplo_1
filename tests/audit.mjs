import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const html = await readFile(join(root, "index.html"), "utf8");
const mimeTypes = { ".css": "text/css", ".js": "text/javascript", ".html": "text/html" };

const server = createServer(async (request, response) => {
  const requestPath = request.url === "/" ? "/index.html" : request.url;
  const filePath = join(root, decodeURIComponent(requestPath));

  try {
    const content = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] ?? "text/plain" });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

const pageUrl = await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${server.address().port}`));
});

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const pageErrors = [];
await page.route("**/*", async (route) => {
  if (route.request().url().startsWith("https://")) {
    await route.abort();
    return;
  }
  await route.continue();
});
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

  const axeResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  assert.equal(axeResults.violations.length, 0, JSON.stringify(axeResults.violations, null, 2));
  assert.equal(pageErrors.length, 0, `Errores JavaScript: ${pageErrors.join(" | ")}`);

  const structure = await page.evaluate(() => {
    const externalLinks = [...document.querySelectorAll('a[href^="http"]')];
    return {
      lang: document.documentElement.lang,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      h1Count: document.querySelectorAll("h1").length,
      landmarks: ["header", "nav", "main", "footer"].every((selector) => document.querySelector(selector)),
      imagesHaveAlt: [...document.images].every((image) => image.alt.trim().length > 0),
      buttonsHaveType: [...document.querySelectorAll("button")].every((button) => button.type === "button"),
      externalLinksAreSafe: externalLinks.every((link) => {
        const rel = link.rel.split(/\s+/);
        return link.target === "_blank" && rel.includes("noopener") && rel.includes("noreferrer");
      }),
      externalUrlsAreHttps: externalLinks.every((link) => link.href.startsWith("https://")),
      internalTargetsExist: [...document.querySelectorAll('a[href^="#"]')].every((link) => document.querySelector(link.hash)),
    };
  });

  assert.equal(structure.lang, "es", "El documento debe declarar lang=es");
  assert.ok(structure.title, "Falta el título del documento");
  assert.ok(structure.description, "Falta la meta descripción");
  assert.equal(structure.h1Count, 1, "Debe existir un único h1");
  assert.ok(structure.landmarks, "Faltan landmarks HTML5 principales");
  assert.ok(structure.imagesHaveAlt, "Todas las imágenes deben tener alt no vacío");
  assert.ok(structure.buttonsHaveType, "Los botones deben declarar type");
  assert.ok(structure.externalLinksAreSafe, "Los enlaces externos deben usar target=_blank y rel seguro");
  assert.ok(structure.externalUrlsAreHttps, "Los enlaces externos deben usar HTTPS");
  assert.ok(structure.internalTargetsExist, "Todos los enlaces internos deben apuntar a un destino existente");

  for (const width of [320, 398, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload({ waitUntil: "domcontentloaded" });
    const responsiveState = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      mobileMenuClosed: window.innerWidth > 760 || document.querySelector(".main-nav").hidden,
    }));
    assert.equal(responsiveState.overflow, false, `Overflow horizontal a ${width}px`);
    assert.equal(responsiveState.mobileMenuClosed, true, `El menú móvil debe iniciar cerrado a ${width}px`);
  }

  await page.setViewportSize({ width: 320, height: 900 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".menu-toggle").click();
  assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "true");
  assert.equal(await page.locator(".main-nav").getAttribute("hidden"), null);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "false");
  assert.equal(await page.locator(".menu-toggle").getAttribute("aria-label"), "Abrir menú");

  console.log("Auditoría CI/CD: HTML5, semántica, ARIA, WCAG 2 A/AA, seguridad de enlaces y responsive OK.");
} finally {
  await context.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}