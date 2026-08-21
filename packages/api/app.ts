import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { errorHandler } from "./src/middleware/error-handler";
import { rateLimiter } from "./src/middleware/rate-limiter";
import { appLanguage } from "./src/middleware/app-language";
import { router } from "./src/routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(appLanguage);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api/", rateLimiter);

app.use("/api", router);

const openApiSpec = yaml.load(
  fs.readFileSync(path.join(__dirname, "openapi.yaml"), "utf8"),
) as object;
app.get("/api/openapi.yaml", (_req, res) =>
  res.sendFile(path.join(__dirname, "openapi.yaml")),
);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export { app };
