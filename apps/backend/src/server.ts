import express from "express";
import { config } from "./configs";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import routesV1 from "./routes/v1";
import compression from "compression";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
