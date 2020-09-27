require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const movieData = require("./movieData");

const API_TOKEN = process.env.API_TOKEN;

const app = express();

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(function validateBearer(req, res, next) {
  const authVal = req.get("Authorization") || "";

  if (!authVal.toLowerCase().startsWith("bearer")) {
    return res.status(401).json({ message: "Missing Bearer Header" });
  }
  const token = authVal.split(" ")[1];
  if (token !== API_TOKEN) {
    return res.status(401).json({ message: "Unauthorized request" }); //Invalid Token
  }
  next();
});
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

function handleTypes(req, res, next) {
  const { genre, country, avg_vote } = req.query;
  let results = [...movieData];

  if (genre) {
    results = results.filter((movie) =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  if (country) {
    results = results.filter((movie) =>
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }
  if (avg_vote) {
    results = results.filter(
      (movie) => Number(movie.avg_vote) >= Number(avg_vote)
    );
  }

  res.json(results);
  next();
}

app.get("/movie", handleTypes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server Started on ${PORT}`);
});
