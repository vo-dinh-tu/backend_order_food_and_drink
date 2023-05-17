const middlewares = require("./auth.middlewares");
const db = require("../models");
const Cart = db.cart;
const CartItem = db.cartItem;
const Order = db.order;
const OrderItem = db.orderItem;

exports.createCashOrder = async (req, res) => {
    try {
        const { cartId } = req.body;
        if (!cartId) {
            return res.status(400).send({ message: "No cart ID provided." });
        }
        const order = await convertHelper.convertCartToOrder(cartId, "cash");
        res.status(200).send({ message: "Order created successfully.", order });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.getListOrder = async (req, res) => {
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        var orders = auth.role == "user" ? await Order.find({customer_id: auth.id}) : await Order.find({});
        res.status(200).json( orders );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        if (!req.param.orderId) {
            return res.status(400).send({ message: "No order ID provided." });
        }

        const order = await Order.findById(req.param.orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const orderItems = await OrderItem.find({order_id: req.param.orderId});
        res.status(200).json({ order, orderItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
};

exports.updateStatusOrder = async (req, res) => {
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        if (!req.body.orderId || !req.body.status) {
            return res.status(400).send({ message: "No order ID provided or Status." });
        }

        const order = await Order.findById(req.body.orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (req.body.status == "canceled" && (order.status == "processing" || order.status == "completed")) {
            return res.status(400).send({ message: "Can't cancel." });
        }
        order.status = req.body.status;
        await order.save();
        res.status(200).json({ message: "Updated status." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
};
