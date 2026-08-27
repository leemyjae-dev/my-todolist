const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const categoryRoutes = require("./modules/category/category.routes");
const todoRoutes = require("./modules/todo/todo.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/todos", todoRoutes);

app.use(errorHandler);

module.exports = app;
//주석
