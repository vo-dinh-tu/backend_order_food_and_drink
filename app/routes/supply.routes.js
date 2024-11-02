module.exports = app => {
    const supply = require("../controllers/supply.controller.js");
    var router = require("express").Router();

    // Create
    router.post("/", supply.create);

    // // Get list
    router.get("/", supply.getList);

    // Get by Id
    router.get("/:id", supply.getSupplyById);

    router.put("/export/:id", supply.export);

    // Update
    router.put('/:id', supply.update);

    // Delete
    router.delete('/:id', supply.delete);

    app.use("/api/supply", router);
}