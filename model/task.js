const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  id: Number,
  title: String,
  is_completed: Boolean,
});

const task = mongoose.model("task", taskSchema);

module.exports = task;
