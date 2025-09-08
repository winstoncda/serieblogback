import mongoose, { Schema } from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minLength: 3 },
    content: { type: String, required: true, minLength: 50 },
    image: { type: String, default: null },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    viewedBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
