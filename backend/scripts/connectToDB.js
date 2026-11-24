// server/scripts/connectToDB.js
const mongoose = require("mongoose");
const { printf, saveLogToDB } = require("../functions");

async function connectToDatabase(uri, mode = "SRV") {
  try {
    const connection = mongoose.createConnection(uri);
    await new Promise((resolve, reject) => {
      connection.once("open", resolve);
      connection.on("error", reject);
    });

    printf("success", `Conectado a la base de datos: ${connection.name}, Modo: ${mode}`);
    console.log('\n');
    return connection;
  } catch (error) {
    // Manejo personalizado de errores comunes
    if (error.message && error.message.toLowerCase().includes("timeout")) {
      printf("error", "⏱️ Timeout: No se pudo conectar a MongoDB.");
    } else if (error.message && error.message.toLowerCase().includes("network")) {
      printf("error", "🌐 Error de red: Revisa tu firewall o red.");
    } else if (error.code === "ECONNREFUSED" || error.syscall === "querySrv") {
      printf("error", "🧭 Error DNS: No se puede resolver el host de MongoDB.");
    }
    const dbName = (typeof uri === 'string' && uri.includes('.net/')) ? uri.split('.net/')[1] : 'unknown';
    printf("error", `Error conectando a la base de datos ${dbName} Modo: ${mode}, ${error.code || error.syscall || error.message}`);
    console.log('\n');
    return null;
  }
}

/**
 * Cierra una conexión específica a MongoDB
 * @param {mongoose.Connection} connection
 */
async function disconnectFromDatabase(connection) {
  try {
    await connection.close();
    printf("log", "MongoDB desconectado correctamente");
  } catch (error) {
    printf("error", `Error al desconectar MongoDB: ${error}`);
  }
}

module.exports = { connectToDatabase, disconnectFromDatabase };
