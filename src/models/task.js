const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: "string",
      trim: true,
      required: true,
    },
    completed: {
      type: "boolean",
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Tasks = mongoose.model("Task", taskSchema);

module.exports = Tasks;
