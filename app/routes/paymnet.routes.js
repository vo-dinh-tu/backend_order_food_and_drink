module.exports = app => {
    const payment = require("../controllers/payment.controller.js");
  
    var router = require("express").Router();
  
    // Create
    router.post("/", payment.createPaymentUrl);

    app.use("/api/payment", router);
  };
  