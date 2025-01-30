import "dotenv/config";
import "reflect-metadata";
import express from "express";
import AppDataSource from "./config/ormconfig";
import { SwaggerConfig } from "./config/swagger.config";
import cors from 'cors';



const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

// Middleware for parsing JSON requests
app.use(express.json());
app.use(cors());

// setup swagger only for development
SwaggerConfig.setup(app);

// Health check route
app.get("/", (req, res) => {
  res.send("VolunChain API is running!");
});

// Initialize the database and start the server
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      if (ENV === "development") {
        console.log(`📚 Swagger docs available at http://localhost:${PORT}/api/docs`);
      }
    });
  })
  .catch((error) => {
    console.error("❌ Error during database initialization:", error);
  });
