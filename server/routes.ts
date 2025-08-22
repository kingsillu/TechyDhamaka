import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchAllFeeds } from "./services/feedService";
import { insertArticleSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });
  
  // Get articles by category
  app.get("/api/articles/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getArticlesByCategory(category);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({ message: "Failed to fetch articles by category" });
    }
  });
  
  // Refresh feeds
  app.post("/api/articles/refresh", async (req, res) => {
    try {
      console.log("Starting feed refresh...");
      
      // Clear existing articles
      await storage.clearArticles();
      
      // Fetch fresh content
      const articles = await fetchAllFeeds();
      
      // Store articles
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

  const httpServer = createServer(app);
  
  // Initialize feeds on server start
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
  }, 1000);

  return httpServer;
}
