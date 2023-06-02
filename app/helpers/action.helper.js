const db = require("../models");
const Customer = db.customer;

exports.updateSocket = async (userId, socketId) => {
    try {
        const customer = await Customer.findById(userId);
        customer.socket_id = socketId;
        await customer.save();
    } catch (error) {
        console.log(error);
    }
};
