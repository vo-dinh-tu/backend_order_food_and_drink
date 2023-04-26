module.exports = app => {
    const customer = require("../controllers/customer.controller.js");
  
    var router = require("express").Router();

    app.use("/api/customer", router);
  };
  