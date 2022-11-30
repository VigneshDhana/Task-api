require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cors = require("cors");
const port = process.env.PORT || 5000;
const task = require("./model/task");
const count = require("./model/count");

mongoose.connect("mongodb://localhost/task");

const app = express();

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.post("/v1/tasks", async (req, res) => {
  let newcount = await count.find();
  if (newcount.length === 0) {
    await count.create({ taskcount: 1 });
    newcount = await count.find();
  }
  if (req.body.tasks) {
    let lastcount = newcount[0].taskcount;
    let arr = req.body.tasks;
    let resArr = [];
    arr.forEach(async (item) => {
      await task.create({
        id: lastcount,
        title: item.title,
        is_completed: item.is_completed || false,
      });
      resArr.push({ id: lastcount });
      lastcount++;
    });
    newcount[0].taskcount = lastcount;
    await count.updateOne({ id: newcount[0]._id }, newcount[0]);
    res.status(201).send({ tasks: resArr });
  } else {
    await task.create({
      id: newcount[0].taskcount,
      title: req.body.title,
      is_completed: false,
    });
    let lastcount = newcount[0].taskcount;
    newcount[0].taskcount = lastcount + 1;
    await count.updateOne({ id: newcount[0]._id }, newcount[0]);
    res.status(201).send({ id: lastcount });
  }
});

app.get("/v1/tasks", async (req, res) => {
  let result = await task.find();
  res.status(200).send({ tasks: result });
});

app.get("/v1/tasks/:id", async (req, res) => {
  let result = await task.findOne({ id: req.params.id });
  if (result.length) {
    res.status(200).send(result);
  } else {
    res.status(404).send({
      error: "There is no task at that id",
    });
  }
});

app.delete("/v1/tasks/:id", async (req, res) => {
  await task.deleteOne({ id: req.params.id });
  res.sendStatus(204);
});

app.delete("/v1/tasks/", async (req, res) => {
  let arr = req.body.tasks;
  arr.forEach(async (item) => {
    await task.deleteOne({ id: item.id });
  });
  res.sendStatus(204);
});

app.put("/v1/tasks/:id", async (req, res) => {
  let taskUpdate = await task.findOne({ id: req.params.id });
  if (taskUpdate) {
    taskUpdate.title = req.body.title;
    taskUpdate.is_completed = req.body.is_completed;
    await task.updateOne({ id: req.params.id }, taskUpdate);
    res.sendStatus(204);
  } else {
    res.status(404).send({
      error: "There is no task at that id",
    });
  }
});

app.listen(port, () => console.log(`server running on port ${port}`));
