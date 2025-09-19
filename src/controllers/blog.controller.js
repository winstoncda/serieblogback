import Blog from "../models/blog.schema.js";

// Créer un blog
export const createBlog = async (req, res) => {
  console.log(req);
  try {
    const { title, content, image } = req.body;
    const blog = await Blog.create({
      title,
      content,
      image, // URL Supabase
      author: req.user._id, // récupéré via middleware
    });
    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Lister tous les blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "username email")
      .populate({
        path: "ratings",
        populate: { path: "author", select: "username email" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id)
      .populate("author", "username email")
      .populate({
        path: "ratings",
        populate: { path: "author", select: "username email" },
      })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } }, // commentaires récents d'abord
        populate: { path: "author", select: "username email" },
      });

    if (!blog) return res.status(404).json({ message: "Blog non trouvé" });
    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
