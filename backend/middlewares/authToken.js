/**
 * Middleware de autenticación para verificar tokens JWT
 * Uso: app.use('/ruta-protegida', authenticateToken, controlador)
 */

const { verifyToken, saveLogToDB } = require("../functions");

const authenticateToken = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    // Verificar el token
    const decoded = verifyToken(token);

    // Agregar los datos del token al objeto request
    req.user = decoded;
    next();
  } catch (error) {
    saveLogToDB({ message: `Error de autenticación: ${error.message}`, level: "warn", client: "vps" }, "server");
    
    if (error.message === "Token expirado") {
      return res.status(401).json({ error: "Token expirado, inicia sesión nuevamente" });
    }
    
    return res.status(403).json({ error: error.message || "Token inválido" });
  }
};

module.exports = authenticateToken;
