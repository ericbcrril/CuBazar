// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const { connectToDatabase } = require("./scripts/connectToDB");
const { printf, saveLogToDB } = require("./functions");
const initCronJobs = require('./cronJobs'); // Importas tu archivo

const app = express();
const PORT = process.env.PORT || 5000;
const ORIGIN_URL = process.env.ORIGIN_URL;

printf("log", "Iniciando servidor...");

// Middlewares globales
app.use( 
  cors({ 
    origin: (origin, callback) => {
      // Lista de orígenes permitidos
      const allowedOrigins = ORIGIN_URL;

      // Si el origen está en la lista permitida, se acepta la solicitud
      if (allowedOrigins.includes(origin) || !origin) {
        // Si no hay origen (por ejemplo, cuando se hace desde Postman o cURL)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// Para servir imágenes y archivos subidos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function startServer() {
  // Conectar a la base de datos
  let db0 = await connectToDatabase(process.env.URI_SRV+'cuBazar-db');
  if (!db0) {
    db0 = await connectToDatabase(process.env.URI_NOT_SRV0 +'cuBazar-db'+ process.env.URI_NOT_SRV1, "NOT-SRV");
  }

  // #region DB Cubazar
  if (db0) {
    const modelo = db0.model(
      "customers-accounts",
      require("./apps/cubazar/models/customersAccounts"),
    );
    
    

    const cuBazarRoutes = require("./apps/cuBazar/routes/index")({
      customersAccounts: cuBazarCustomersAccounts,
    });
    app.use("/api/cubazar", cubazarRoutes);
  }

 

  app.listen(PORT, "0.0.0.0", () => {
    printf("success", `Servidor activo en puerto: ${PORT}`);
    /* reset al escribir "reset" */
    process.stdin.on("data", (data) => {
      if (data.toString().trim() === "reset") {
        printf("log", "Reiniciando servidor...");
        process.exit(0);
      }

      if (data.toString().trim() === "reset cuBazar-db") {
        printf("log", "Re-conectando a la base de datos db0...");
        connectToDatabase(process.env.cuBazar_URI).then((newDb0) => {
          if (newDb0) {
            const cubazarCustomersAccounts = newDb0.model(
              "customers-accounts",
              require("./apps/cubazar/models/customersAccounts"),
            );
            // Actualizar las rutas con la nueva conexión a la base de datos
            const cuBazarRoutes = require("./apps/cuBazar/routes/index")({
              customersAccounts: cuBazarCustomersAccounts,
            });
            app.use("/api/cubazar", cubazarRoutes);
            printf("success", "Base de datos db0 re-conectada exitosamente.");
          } else {
            printf("error", "Error al reconectar a la base de datos db0.");
          }
        });
      }

    });
  });
}

startServer();
