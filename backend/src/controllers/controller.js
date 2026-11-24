// Recibe el modelo Post para poder usarlo
module.exports = function(Post) {
  return {
    // Obtener todos 
    async getAll(req, res) {
      try {
        const posts = await Post.find();
        res.json(posts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    // Obtener por ID
    async getById(req, res) {
      try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post no encontrado" });
        res.json(post);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    // Crear
    async create(req, res) {
      try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json(newPost);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },

    // Actualizar por ID
    async update(req, res) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) return res.status(404).json({ error: "Post no encontrado" });
        res.json(updatedPost);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },

    // Eliminar por ID
    async delete(req, res) {
      try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ error: "Post no encontrado" });
        res.json({ message: "Post eliminado" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  };
};
