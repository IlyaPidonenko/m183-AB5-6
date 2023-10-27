const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { initializeDatabase, queryDB } = require("./database");
const jwt = require("jsonwebtoken");



let db;
 
const jwtSecret = process.env.JWT_SECRET || "supersecret";
 
const posts = [
  {
    id: 1,
    title: "Introduction to JavaScript",
    content:
      "JavaScript is a dynamic language primarily used for web development...",
  },
  {
    id: 2,
    title: "Functional Programming",
    content:
      "Functional programming is a paradigm where functions take center stage...",
  },
  {
    id: 3,
    title: "Asynchronous Programming in JS",
    content:
      "Asynchronous programming allows operations to run in parallel without blocking the main thread...",
  },
];
 
const initializeAPI = async (app) => {
  db = initializeDatabase();
  app.post(
    "/api/login",
    body("username")
      .notEmpty()
      .withMessage("Username is required.")
      .isEmail()
      .withMessage("Invalid email format."),
    body("password")
      .isLength({ min: 10, max: 64 })
      .withMessage("Password must be between 10 to 64 characters.")
      .escape(),
    login
  );
  app.get("/api/posts", getPosts);
};
 
const login = async (req, res) => {
  // Validate request
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const formattedErrors = [];
    result.array().forEach((error) => {
      console.log(error);
      formattedErrors.push({ [error.path]: error.msg });
    });
    return res.status(400).json(formattedErrors);
  }
  req.log.info("Request angenommen");

 
  // Check if user exists
  const { username, password } = req.body;
  const getUserQuery = `
    SELECT * FROM users WHERE username = '${username}';
  `;
  const user = await queryDB(db, getUserQuery);
  if (user.length === 0) {
    return res
      .status(401)
      .json({ username: "Username does not exist. Or Passwort is incorrect." });
  }
  req.log.info("Benutzer Identität bestätigt");

  // Check if password is correct
  const hash = user[0].password;
  const match = await bcrypt.compare(password, hash);
  if (!match) {
    return res
      .status(401)
      .json({ username: "Username does not exist. Or Passwort is incorrect." });
  }
  req.log.info("Passwort akzeptiert");

  // Create JWT
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: { username, roles: [user[0].role] },
    },
    jwtSecret
  );
  req.log.info("JWT Tocken wurde erstellt");

 
  return res.send(token);
};
 
const getPosts = async(req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: "No authorization header." });
  }
  const [prefix, token] = authorization.split(" ");
  if (prefix !== "Bearer") {
    return res.status(401).json({ error: "Invalid authorization prefix." });
  }
  const tokenValidation = jwt.verify(token, jwtSecret);
  if (!tokenValidation?.data) {
    return res.status(401).json({ error: "Invalid token." });
  }
  if (!tokenValidation.data.roles?.includes("viewer")) {
    return res.status(403).json({ error: "You are not a viewer." });
  }
  const getPostsQuery = "SELECT * FROM posts;";
  try {
    const fetchedPosts = await queryDB(db, getPostsQuery);
    return res.json(fetchedPosts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
 
module.exports = { initializeAPI };
 