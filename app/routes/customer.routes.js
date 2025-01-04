module.exports = app => {
  const customer = require("../controllers/customer.controller.js");

  var router = require("express").Router();
  // Get customer
  router.get("/", customer.getCustomer);
  // update
  router.post("/", customer.updateCustomer);

  app.use("/api/user", router);
};
