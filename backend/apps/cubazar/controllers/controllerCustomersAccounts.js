const { request } = require("express");
const { saveLogToDB } = require("../../../functions");
const {
  genRandomNumber,
  hashValue,
  printf,
  compareHash,
  generateToken,
  verifyToken,
} = require("../../../functions");

// Recibe el modelo User para poder usarlo
module.exports = function (User) {
  return {
    // Obtener por ID
    async getById(req, res) {
      try {
        const post = await User.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "User no encontrado" });

        userData = { ...post._doc };
        delete userData.password_hash; // Eliminar el campo password_hash
        delete userData.metadata;

        res.json(userData);
      } catch (error) {
        res.status(500).json({ error: error.message });
        await saveLogToDB({ message: `Error al obtener usuario por ID: ${error.message}`, level: "error", client: "vps" }, "server");
      }
    },

    // Crear nuevo usuario
    async create(req, res) {
      try {
        const userData = {
          ...req.body,
          password_hash: await hashValue(req.body.password_hash), // Hashear la contraseña
          metadata: {
            ...req.body.metadata,
            status: "active",
          },
          user_name: `user${genRandomNumber(4)}`, // Generar un nombre de usuario aleatorio
        };

        const newUser = new User(userData);

        await newUser.save();
        res.status(201).json(newUser);
        await saveLogToDB({ message: `Nuevo usuario registrado: ${userData.user_name}`, level: "log", client: "vps" }, "user");
      } catch (error) {
        res.status(400).json({ error: error.message });
        await saveLogToDB({ message: `Error al crear usuario: ${error.message}`, level: "error", client: "vps" }, "server");
      }
    },

    // Actualizar por ID
    async update(req, res) {
      try {
        const updatedPost = await User.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );

        // metadata de última actualización
        if (updatedPost) {
          updatedPost.metadata = {
            ...updatedPost.metadata,
            last_updated: new Date(),
          };
        }


        if (!updatedPost)
          return res.status(404).json({ error: "User no encontrado" });
        res.json(updatedPost);
        await saveLogToDB({ message: `Usuario actualizado: ${updatedPost.user_name}`, level: "log", client: "vps" }, "user");
      } catch (error) {
        res.status(400).json({ error: error.message });
        await saveLogToDB({ message: `Error al actualizar usuario: ${error.message}`, level: "error", client: "vps" }, "user");
      }
    },

    // Login
    async login(req, res) {
      try {
        const { user_name, password_hash, client, device } = req.body;
        const id = genRandomNumber(8);
        await saveLogToDB({ message: `${id} Intento de login para usuario: ${user_name}`, level: "log", client: client, device: device }, "user");

        if (!user_name || !password_hash) {
          return res
            .status(400)
            .json({ error: "Usuario y contraseña son requeridos" });
        }

        // Buscar usuario por user_name
        const existingUser = await User.findOne({ user_name });

        if (!existingUser) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Verificar si la cuenta está activa (desde DB, no desde el cliente)
        if (existingUser.metadata.status !== "active") {
          return res.status(403).json({ error: "Cuenta inhabilitada" });
        }

        // Comparar contraseñas
        const isMatch = await compareHash(
          password_hash,
          existingUser.password_hash
        );
        if (!isMatch) {
          return res.status(401).json({ error: "Contraseña incorrecta" });
          await saveLogToDB({ message: `${id} Contraseña incorrecta: ${user_name}`, level: "log", client: client, device: device }, "user");
        }

        // Actualizar metadata de último acceso
        existingUser.metadata = {
          ...existingUser.metadata,
          last_login: new Date(),
        };
        await existingUser.save();

        // Preparar objeto de respuesta sin password ni datos internos
        const {
          password_hash: _,
          metadata: __,
          ...safeUser
        } = existingUser.toObject();

        // Generar token JWT con información del usuario
        const token = generateToken(
          {
            userId: existingUser._id.toString(),
            userName: existingUser.user_name,
            email: existingUser.email,
          },
          86400 // Token válido por 24 horas
        );

        // Enviar respuesta con token de sesión
        res.status(200).json({
          message: "Login exitoso",
          user: safeUser,
          token: token, // Token para mantener sesión activa
          tokenType: "Bearer", // Tipo de token
          expiresIn: 86400, // Tiempo de expiración en segundos
        });
        await saveLogToDB({ message: `${id} Login exitoso usuario: ${user_name}`, level: "log", client: client, device: device }, "user");
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    // recuperar usuario por token (para mantener sesión activa)
    async getUserByToken(req, res) {
      try {
        const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN
        if (!token) {
          return res.status(401).json({ error: "Token no proporcionado" });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
          return res.status(401).json({ error: "Token inválido" });
        }
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(200).json({ user });
      } catch (error) {
        res.status(500).json({ error: error.message });

        console.error("Error en getUserByToken:", error);
      }
    }
  }

};
