import express from "express";
import { config } from "./configs";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import routesV1 from "./routes/v1";
import compression from "compression";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import { startCronJobs } from "./services/v1/cron.service";

const app = express();

const allowedOrigins = (config.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, //only compress response larger than 1kb
  })
);

//use helmet to enhance security by settings various HTTP headers
app.use(helmet());

app.use("/api/v1", routesV1);

app.use((req, res) => {
  return res
    .status(404)
    .json({ error: "NotFound", message: "Route not found" });
});

app.use(errorHandler);

app.listen(config.SERVER_PORT, () => {
  console.log(`Server is running on http://localhost:${config.SERVER_PORT}`);
});

// Start cron jobs
startCronJobs();
