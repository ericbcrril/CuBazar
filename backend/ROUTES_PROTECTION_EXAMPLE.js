/**
 * EJEMPLO DE CÓMO PROTEGER RUTAS CON TOKENS JWT
 * 
 * Este archivo es un ejemplo. Cópialo en tu archivo routes/index.js
 * para proteger las rutas que requieran autenticación.
 */

const express = require("express");
const upload = require("../../../middlewares/uploadImg");
const authenticateToken = require("../../../middlewares/authToken"); // Importar middleware

module.exports = ({ customersAccounts, customersProjects, customersMemberships }) => {
  const router = express.Router();
  const controllerAccounts = require("../controllers/controllerCustomersAccounts")(customersAccounts);
  const controllerProjects = require("../controllers/controller")(customersProjects);
  const controllerMemberships = require("../controllers/controller")(customersMemberships);

  // ===== RUTAS PÚBLICAS (sin autenticación) =====
  router.post("/customers-accounts/login/", controllerAccounts.login);
  router.post("/customers-accounts/", controllerAccounts.create); // Registro público

  // ===== RUTAS PROTEGIDAS (requieren token JWT) =====
  
  // Obtener datos del usuario (solo si está autenticado)
  router.get(
    "/customers-accounts/getUser/:id", 
    authenticateToken, // Middleware de autenticación
    controllerAccounts.getById
  );

  // Actualizar usuario (solo si está autenticado)
  router.put(
    "/customers-accounts/:id", 
    authenticateToken,
    controllerAccounts.update
  );

  // Proyectos del usuario
  router.get(
    "/customers-projects/", 
    authenticateToken,
    controllerProjects.getAll
  );
  
  router.get(
    "/customers-projects/:id", 
    authenticateToken,
    controllerProjects.getById
  );

  router.post(
    "/customers-projects/", 
    authenticateToken,
    upload.single("image"), // Si tienes upload de archivos
    controllerProjects.create
  );

  router.put(
    "/customers-projects/:id", 
    authenticateToken,
    controllerProjects.update
  );

  // Membresías del usuario
  router.get(
    "/customers-memberships/", 
    authenticateToken,
    controllerMemberships.getAll
  );

  router.get(
    "/customers-memberships/:id", 
    authenticateToken,
    controllerMemberships.getById
  );

  router.post(
    "/customers-memberships/", 
    authenticateToken,
    controllerMemberships.create
  );

  router.put(
    "/customers-memberships/:id", 
    authenticateToken,
    controllerMemberships.update
  );

  // Rutas públicas que podrían ser útiles
  router.get(
    "/customers-projects/getByField/:field/:value",
    controllerProjects.getByField
  );

  router.get(
    "/customers-memberships/getByField/:field/:value",
    controllerMemberships.getByField
  );

  return router;
};

/**
 * CÓMO USAR EN EL FRONTEND
 * 
 * 1. Hacer login:
 *    POST /customers-accounts/login/
 *    {
 *      "user_name": "user123",
 *      "password_hash": "password",
 *      "client": "web",
 *      "device": "mobile"
 *    }
 * 
 * 2. Guardar el token:
 *    const { token } = response.data;
 *    localStorage.setItem('authToken', token);
 * 
 * 3. Usar en requests protegidas:
 *    const token = localStorage.getItem('authToken');
 *    const config = {
 *      headers: {
 *        'Authorization': `Bearer ${token}`
 *      }
 *    };
 *    
 *    axios.get('/customers-accounts/getUser/123', config)
 * 
 * 4. En caso de logout:
 *    localStorage.removeItem('authToken');
 */
