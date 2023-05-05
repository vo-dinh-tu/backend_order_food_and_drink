module.exports = app => {
    const cart = require("../controllers/cart.controller.js");
  
    var router = require("express").Router();
  
    // add cart
    router.post("/", cart.addCart);

    // Get cart
    router.get("/", cart.getCart);

    app.use("/api/cart", router);
  };
  