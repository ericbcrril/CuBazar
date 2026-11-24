const express = require("express");
const upload = require("../../../middlewares/uploadImg");

module.exports = ({ customersAccounts, customersProjects, customersMemberships }) => {
  const router = express.Router();
  const controllerAccounts = require("../controllers/controllerCustomersAccounts")(customersAccounts);
  const controllerProjects = require("../controllers/controller")(customersProjects);
  const controllerMemberships = require("../controllers/controller")(customersMemberships);

  // Rutas para customersAccounts 
  router.get("/customers-accounts/getUser/:id", controllerAccounts.getById);
  router.post("/customers-accounts/login/", controllerAccounts.login);
  router.post("/customers-accounts/", controllerAccounts.create);
  router.put("/customers-accounts/:id", controllerAccounts.update);
  router.get("/customers-accounts/me", controllerAccounts.getUserByToken);

  // Rutas para customersProjects
  router.get("/customers-projects/", controllerProjects.getAll);
  router.get("/customers-projects/:id", controllerProjects.getById);
  router.get("/customers-projects/getByField/:field/:value", controllerProjects.getByField);
  router.post("/customers-projects/", controllerProjects.create);
  router.put("/customers-projects/:id", controllerProjects.update);

  // Rutas para customersMemberships
  router.get("/customers-memberships/", controllerMemberships.getAll);
  router.get("/customers-memberships/:id", controllerMemberships.getById);
  router.get("/customers-memberships/getByField/:field/:value", controllerMemberships.getByField);
  router.post("/customers-memberships/", controllerMemberships.create);
  router.put("/customers-memberships/:id", controllerMemberships.update);

  return router;
};
