const mongoose = require("mongoose");

const countSchema = new mongoose.Schema({
  taskcount: Number,
});

const count = mongoose.model("taskcount", countSchema);

module.exports = count;
