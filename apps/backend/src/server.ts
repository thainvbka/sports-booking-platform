import express from "express";
import { config } from "./configs";
import morgan from "morgan";

const app = express();
const SERVER_PORT = config.SERVER_PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sports Booking Platform API" });
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on http://localhost:${SERVER_PORT}`);
});
