import "dotenv/config";
import "reflect-metadata";
import express from "express";
import AppDataSource from "./config/ormconfig";

const app = express();
const PORT = process.env.PORT || 3000;

console.info("Starting VolunChain API...");

// Middleware for parsing JSON requests
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("VolunChain API is running!");
});

// Initialize the database and start the server
AppDataSource.initialize()
  .then(() => {
    console.info("Database connected successfully!");

    app.listen(PORT, () => {
      console.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during database initialization:", error);
  });
