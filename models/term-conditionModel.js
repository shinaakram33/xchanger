const mongoose = require("mongoose");

const termAndConditionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Must contain some text"],
    }
  },
  { timestamps: true }
);

const termAndCondition = mongoose.model("termAndCondition", termAndConditionSchema);

module.exports = termAndCondition;
