const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* ✅ SERVE IMAGES FROM uploads FOLDER */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
