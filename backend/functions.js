const mongoose = require("mongoose");

/*
Rojo: \x1b[31m
Verde: \x1b[32m
Amarillo: \x1b[33m
Azul: \x1b[34m
Magenta: \x1b[35m
Cyan: \x1b[36m
Blanco: \x1b[37m
Reset (para volver al color por defecto): \x1b[0m
*/
exports.printf = (type, message, db = false) => {
  let color;
  switch (type) {
    case "log":
      color = "\x1b[34m";
      break;
    case "error":
      color = "\x1b[31m";
      break;
    case "success":
      color = "\x1b[32m";
      break;
    case "warn":
      color = "\x1b[33m";
      break;
    default:
      color = "\x1b[37m";
  }

  console.log(`${color}${message}${"\x1b[0m"}`);
};

exports.genRandomNumber = ( length ) => {
  // Generar un número aleatorio de "length" dígitos
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;

  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const bcrypt = require("bcrypt");

const defSaltRounds = 10; //Entre mas alto, mas seguro pero mas lento

exports.hashValue = async ( value, saltRounds = defSaltRounds ) => {
  const hash = await bcrypt.hash(value, saltRounds);
  return hash;
}

exports.compareHash = async ( value, hash ) => {
  const match = await bcrypt.compare(value, hash);
  return match;
}

const path = require("path");
const fs = require("fs").promises;
const sharp = require("sharp");

exports.imgToWebp = async (filePath) => {
  try {
    const outputPath = filePath.replace(path.extname(filePath), ".webp");

    await sharp(filePath).webp({ quality: 50 }).toFile(outputPath);

    await this.deleteFile(filePath);

    return outputPath;
  } catch (err) {
    await this.saveLogToDB({ message: `Error al convertir imagen a WebP: ${err.message}`, level: "error", client: "vps" }, "server");
    this.printf("error", `No se pudo eliminar la imagen: ${err}`);
    return filePath; // Por si necesitas continuar
  }
};

const fsSync = require("fs");

exports.deleteFile = async (filePath, maxRetries = 5) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Asegúrate de que el archivo no sea solo lectura
      if (fsSync.existsSync(filePath)) {
        fsSync.chmodSync(filePath, 0o666);
      }

      await fs.unlink(filePath);
      this.printf("success", `✅ Imagen eliminada: ${filePath}`);
      await this.saveLogToDB({ message: `Imagen eliminada: ${filePath}`, level: "log", client: "vps" }, "server");
      return true;
    } catch (err) {
      if (err.code === "EPERM" || err.code === "EBUSY") {
        this.printf(
          "log",
          `⏳ Intento de eliminación ${attempt}/${maxRetries} fallido: ${err.message}`
        );
        await new Promise((res) => setTimeout(res, 300));
        await this.saveLogToDB({ message: `Intento de eliminación ${attempt}/${maxRetries} fallido: ${err.message}`, level: "warn", client: "vps" }, "server");
      } else {
        this.printf("error", `❌ Error al eliminar imagen: ${err.message}`);
        await this.saveLogToDB({ message: `Error al eliminar imagen: ${err.message}`, level: "error", client: "vps" }, "server");
        break;
      }
    }
  }

  this.printf(
    "warn",
    `⚠️ No se pudo eliminar la imagen tras ${maxRetries} intentos: ${filePath}`
  );
  return false;
};

exports.saveLogToDB = async (data, location = "server") => {
  try {
    // Cargar el modelo en tiempo de ejecución, porque al importar este módulo
    // el servidor puede no haber inicializado todavía `bsitesServerLogs`.
    const server = require("./server");
    const modelBsitesServerLogs = server && server.bsitesServerLogs;
    const modelBsitesDBLogs = server && server.bsitesDbLogs;
    const modelBsitesUserLogs = server && server.bsitesUserLogs;

    //Guardamos primero en local
    await this.saveLogToLocalFile(data, location);
    
    let newDocument = null;

    if(location === "server" && modelBsitesServerLogs) {
      newDocument = new modelBsitesServerLogs(data);
    } else if(location === "db" && modelBsitesDBLogs) {
      newDocument = new modelBsitesDBLogs(data);
    } else if(location === "user" && modelBsitesUserLogs) {
      newDocument = new modelBsitesUserLogs(data);
    }

    const savedDocument = await newDocument.save();
    return savedDocument;
  } catch (error) {
    this.printf("error", `Error guardando en la base de datos: ${error.message}`);
    await this.saveLogToLocalFile({ message: error, level: "error" }, "server"); // Guardar en archivo local como respaldo
    throw error;
  }
};

exports.saveLogToLocalFile = async (data, location = "server") => {

  let nameFile = "unknown_logs_fallback.log";

  nameFile = location === "server" && "server_logs_fallback.log";
  nameFile = location === "db" && "db_logs_fallback.log";
  nameFile = location === "user" && "user_logs_fallback.log";

  try {
    const logFilePath = path.join(__dirname, nameFile);
    await fs.appendFile(
      logFilePath,
      JSON.stringify({ ...data, date: new Date() }) + "\n"
    );
    this.printf("success", `Log guardado en archivo local: ${logFilePath}`);
  } catch (error) {
    this.printf("error", `No se pudo guardar log en archivo local: ${error.message}`);
  }
}; 

exports.parseDateOnly = (value) => {
  if (!value) return null;

  const normalized = String(value).trim();
  const separator = normalized.includes('/') ? '/' : '-';
  const parts = normalized.split(separator).map((part) => part.trim());

  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map((part) => Number(part));
  if ([year, month, day].some(Number.isNaN)) return null;

  return new Date(year, month - 1, day);
};

// ===== FUNCIONES DE TOKENS JWT =====
const jwt = require("jsonwebtoken");

/**
 * Genera un token JWT para mantener sesión activa
 * @param {Object} payload - Datos a codificar en el token (ej: { userId, userName })
 * @param {number} expiresIn - Tiempo de expiración en segundos (default: 24 horas)
 * @returns {string} Token JWT
 */
exports.generateToken = (payload, expiresIn = 86400) => {
  try {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  } catch (error) {
    this.printf("error", `Error generando token: ${error.message}`);
    throw new Error("No se pudo generar el token de sesión");
  }
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Datos decodificados del token
 */
exports.verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expirado");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Token inválido");
    }
    throw new Error(error.message);
  }
};