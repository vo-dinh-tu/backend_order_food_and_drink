module.exports = app => {
    const category = require("../controllers/category.controller.js");
  
    var router = require("express").Router();
  
    // Create
    router.post("/", category.create);

    app.use("/api/category", router);
  };
  