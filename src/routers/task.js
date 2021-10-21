const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res) => {
  //const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    const tasks = await task.save();
    res.status(201).send(tasks);
  } catch (err) {
    res.status(400).send(err);
  }
});

///tasks?completed=false
///tasks?limit=10&skip=0
///tasks?sortBy=createdAt_desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/tasks/:taskId", auth, async (req, res) => {
  const _id = req.params.taskId;
  try {
    const tasks = await Task.findOne({ _id, owner: req.user._id });
    res.send(tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch("/tasks/:taskId", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  if (!isValid) {
    res.status(404).send({ err: "Invalid update" });
  }
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      owner: req.user._id,
    });
    // const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/tasks/:taskId", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
