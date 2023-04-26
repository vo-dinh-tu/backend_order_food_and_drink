module.exports = app => {
    const product = require("../controllers/product.controller.js");
  
    var router = require("express").Router();
  
    // Create
    router.post("/", product.create);

    // Get list
    router.get("/", product.getList);

    // Get by Id
    router.get("/:id", product.getProductById);

    // Update
    router.put('/:id', product.update);

    // Delete
    router.delete('/:id', product.delete);

    app.use("/api/category", router);
  };