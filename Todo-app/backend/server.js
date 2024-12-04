const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/todoapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
  description: String,
  category: String,
  status: { type: String, default: "pending" },
});

const Task = mongoose.model("Task", taskSchema);

// Middleware
app.use(bodyParser.json());

// Endpoints

// GET /tasks
app.get("/tasks", async (req, res) => {
  const { completed } = req.query;
  const filter = completed
    ? { status: completed === "true" ? "completed" : "pending" }
    : {};
  const tasks = await Task.find(filter);
  res.json(tasks);
});

// POST /tasks
app.post("/tasks", async (req, res) => {
  const { description, category } = req.body;

  if (!description || !category) {
    return res
      .status(400)
      .json({ error: "Description and category are required." });
  }

  const newTask = new Task({ description, category });
  await newTask.save();
  res.status(201).json(newTask);
});

// GET /tasks/:id
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID." });
  }
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID." });
  }
});

// PUT /tasks/:id
app.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID." });
  }
});

// PUT /tasks/:id/complete
app.put("/tasks/:id/complete", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID." });
  }
});

// GET /tasks/categories
app.get("/tasks/categories", async (req, res) => {
  const categories = await Task.distinct("category");
  res.json(categories);
});

// GET /tasks/categories/:category
app.get("/tasks/categories/:category", async (req, res) => {
  const tasks = await Task.find({ category: req.params.category });
  res.json(tasks);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
