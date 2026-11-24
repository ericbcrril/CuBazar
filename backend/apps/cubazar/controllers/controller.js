// Recibe el modelo Registro para poder usarlo
module.exports = function(Post) {
  const buildResponse = (res) => {
    if (!res) {
      return {
        json: () => undefined,
        status: () => ({ json: () => undefined })
      };
    }

    if (typeof res.status === 'function') {
      return res;
    }

    return {
      ...res,
      status: (code) => ({
        json: (payload) => {
          if (typeof res.json === 'function') {
            return res.json(payload);
          }
          return payload;
        }
      }),
      json: (payload) => {
        if (typeof res.json === 'function') {
          return res.json(payload);
        }
        return payload;
      }
    };
  };

  const sendResponse = (res, statusCode, payload) => {
    if (!res) {
      return payload;
    }

    const response = buildResponse(res);
    if (statusCode) {
      return response.status(statusCode).json(payload);
    }
    return response.json(payload);
  };

  return {
    // Obtener todos 
    async getAll(req, res) {
      try {
        const posts = await Post.find();
        return sendResponse(res, null, posts);
      } catch (error) {
        return sendResponse(res, 500, { error: error.message });
      }
    },

    // Obtener por ID
    async getById(req, res) {
      try {
        const post = await Post.findById(req.params.id);
        if (!post) return sendResponse(res, 404, { error: "Registro no encontrado" });
        return sendResponse(res, null, post);
      } catch (error) {
        return sendResponse(res, 500, { error: error.message });
      }
    },
    
    // Obtener por campo
    async getByField(req, res) {
      try {
        const post = await Post.find({ [req.params.field]: req.params.value }).sort({ _id: -1 }); 
        if (!post) return sendResponse(res, 404, { error: "Registro no encontrado" });
        return sendResponse(res, null, post);
      } catch (error) {
        return sendResponse(res, 500, { error: error.message });
      }
    },

    // Crear
    async create(req, res) {
      try {
        const newPost = new Post(req.body);
        await newPost.save();
        return sendResponse(res, 201, newPost);
      } catch (error) {
        return sendResponse(res, 400, { error: error.message });
      }
    },

    // Actualizar por ID
    async update(req, res) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) return sendResponse(res, 404, { error: "Registro no encontrado" });

        if (updatedPost) {
          updatedPost.metadata = {
            ...updatedPost.metadata,
            last_updated: new Date(),
          };
        }

        return sendResponse(res, null, updatedPost);
      } catch (error) {
        return sendResponse(res, 400, { error: error.message });
      }
    },

    // Eliminar por ID
    async delete(req, res) {
      try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return sendResponse(res, 404, { error: "Registro no encontrado" });
        return sendResponse(res, null, { message: "Registro eliminado" });
      } catch (error) {
        return sendResponse(res, 500, { error: error.message });
      }
    }
  };
};
