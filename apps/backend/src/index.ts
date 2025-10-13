import Express = require("express");

const app = Express();
const PORT = process.env.PORT || 3000;

// Sample route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sports Booking Platform API" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
