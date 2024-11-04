module.exports = app => {
  const staff = require("../controllers/staff.controller.js");

  var router = require("express").Router();

  router.get("/staff", staff.getStaff);

  router.delete("/staff/:id", staff.deleteStaff);

  app.use("/api/admin", router);
};
