// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  articles;
  constructor() {
    this.articles = /* @__PURE__ */ new Map();
  }
  async getArticles() {
    return Array.from(this.articles.values()).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  async getArticlesByCategory(category) {
    return Array.from(this.articles.values()).filter((article) => article.category === category).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  async createArticle(insertArticle) {
    const id = randomUUID();
    const article = { ...insertArticle, id };
    this.articles.set(id, article);
    return article;
  }
  async clearArticles() {
    this.articles.clear();
  }
};
var storage = new MemStorage();

// server/services/feedService.ts
import Parser from "rss-parser";
var parser = new Parser();
var feedSources = [
  // News sources
  { url: "https://feeds.bbci.co.uk/news/rss.xml", category: "news", source: "BBC News" },
  { url: "https://rss.cnn.com/rss/edition.rss", category: "news", source: "CNN" },
  { url: "https://feeds.reuters.com/reuters/topNews", category: "news", source: "Reuters" },
  // Gaming sources
  { url: "https://www.gamespot.com/feeds/mashup/", category: "gaming", source: "GameSpot" },
  { url: "https://feeds.ign.com/ign/games-all", category: "gaming", source: "IGN Gaming" },
  { url: "https://www.polygon.com/rss/index.xml", category: "gaming", source: "Polygon" },
  // Technology sources
  { url: "https://feeds.feedburner.com/TechCrunch", category: "technology", source: "TechCrunch" },
  { url: "https://www.wired.com/feed/rss", category: "technology", source: "Wired" },
  { url: "https://feeds.arstechnica.com/arstechnica/index", category: "technology", source: "Ars Technica" },
  // Entertainment sources
  { url: "https://feeds.feedburner.com/variety/headlines", category: "entertainment", source: "Variety" },
  { url: "https://www.hollywoodreporter.com/feed/", category: "entertainment", source: "Hollywood Reporter" },
  { url: "https://ew.com/feed/", category: "entertainment", source: "Entertainment Weekly" }
];
function extractImageUrl(item, content) {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  if (item["media:content"] && item["media:content"]["$"] && item["media:content"]["$"].url) {
    return item["media:content"]["$"].url;
  }
  if (item["media:thumbnail"] && item["media:thumbnail"]["$"] && item["media:thumbnail"]["$"].url) {
    return item["media:thumbnail"]["$"].url;
  }
  const contentToSearch = item["content:encoded"] || content || item.description || "";
  const imgMatches = contentToSearch.match(/<img[^>]+src=['"](https?:\/\/[^'"]+)['"]/gi);
  if (imgMatches) {
    for (const match of imgMatches) {
      const srcMatch = match.match(/src=['"](https?:\/\/[^'"]+)['"]/i);
      if (srcMatch && srcMatch[1]) {
        const url = srcMatch[1];
        if (!url.includes("1x1") && !url.includes("pixel") && !url.includes("tracking")) {
          return url;
        }
      }
    }
  }
  const ogImageMatch = contentToSearch.match(/<meta[^>]+property=['"](og:image|twitter:image)['"]\s+content=['"](https?:\/\/[^'"]+)['"]/i);
  if (ogImageMatch && ogImageMatch[2]) {
    return ogImageMatch[2];
  }
  return void 0;
}
function truncateSummary(content, maxLength = 200) {
  const textContent = content.replace(/<[^>]*>/g, "").trim();
  if (textContent.length <= maxLength) return textContent;
  const truncated = textContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + "..." : truncated + "...";
}
async function fetchAllFeeds() {
  const articles = [];
  for (const feedSource of feedSources) {
    try {
      console.log(`Fetching feed from ${feedSource.source}...`);
      const feed = await parser.parseURL(feedSource.url);
      const feedArticles = feed.items.slice(0, 10).map((item) => {
        const summary = truncateSummary(
          item.contentSnippet || item.content || item.title || "",
          130
        );
        const imageUrl = extractImageUrl(item, item.content || "") || void 0;
        return {
          title: item.title || "Untitled",
          summary,
          category: feedSource.category,
          externalUrl: item.link || "#",
          imageUrl,
          publishedAt: item.pubDate || (/* @__PURE__ */ new Date()).toISOString(),
          source: feedSource.source
        };
      });
      articles.push(...feedArticles);
    } catch (error) {
      console.error(`Error fetching feed from ${feedSource.source}:`, error);
    }
  }
  for (let i = articles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [articles[i], articles[j]] = [articles[j], articles[i]];
  }
  return articles.slice(0, 50);
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });
  app2.get("/api/articles/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getArticlesByCategory(category);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({ message: "Failed to fetch articles by category" });
    }
  });
  app2.post("/api/articles/refresh", async (req, res) => {
    try {
      console.log("Starting feed refresh...");
      await storage.clearArticles();
      const articles = await fetchAllFeeds();
      for (const articleData of articles) {
        await storage.createArticle(articleData);
      }
      const storedArticles = await storage.getArticles();
      console.log(`Feed refresh complete. Stored ${storedArticles.length} articles.`);
      res.json({
        message: "Feed refresh completed successfully",
        count: storedArticles.length
      });
    } catch (error) {
      console.error("Error refreshing feeds:", error);
      res.status(500).json({ message: "Failed to refresh feeds" });
    }
  });
  const httpServer = createServer(app2);
  setTimeout(async () => {
    try {
      console.log("Initializing feeds on server start...");
      const articles = await fetchAllFeeds();
      for (const articleData of articles) {
        await storage.createArticle(articleData);
      }
      console.log(`Server initialized with ${articles.length} articles.`);
    } catch (error) {
      console.error("Error initializing feeds:", error);
    }
  }, 1e3);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
