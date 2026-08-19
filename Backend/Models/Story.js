const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true, collection: "stories" }
);

module.exports = mongoose.model("Story", storySchema);
