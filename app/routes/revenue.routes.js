module.exports = app => {
    const revenue = require("../controllers/revenue.controller.js");
  
    var router = require("express").Router();
  
    // date
    router.post("/date", revenue.byDate);

    // month
    router.post("/month", revenue.byMonth);

    // year
    router.post("/year", revenue.byYear);

    app.use("/api/revenue", router);
  };
  