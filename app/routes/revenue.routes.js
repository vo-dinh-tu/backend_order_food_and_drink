module.exports = app => {
    const revenue = require("../controllers/revenue.controller.js");
  
    var router = require("express").Router();
  
    // date
    router.post("/calc", revenue.calcu);

    app.use("/api/revenue", router);
  };
  