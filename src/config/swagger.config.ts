import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";

export class SwaggerConfig {
  private static swaggerDocument = YAML.parse(
    fs.readFileSync("./openapi.yaml", "utf8")
  );

  static setup(app: Application): void {
    if (process.env.NODE_ENV !== "development") {
      console.log("⚠️ Swagger is disabled in production mode.");
      return;
    }

    console.log("📚 Swagger is enabled at /api/docs");
    app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerDocument)
    );
  }
}
