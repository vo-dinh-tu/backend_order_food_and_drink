const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.customer = require("./customer.model.js")(mongoose);
db.admin = require("./admin.model.js")(mongoose);
db.category = require("./category.model.js")(mongoose);
db.product = require("./product.model.js")(mongoose);

module.exports = db;
