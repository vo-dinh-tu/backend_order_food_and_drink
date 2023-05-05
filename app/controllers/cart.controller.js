const middlewares = require("./auth.middlewares");
const db = require("../models");
const Product = db.product;
const Cart = db.cart;
const CartItem = db.cartItem;

exports.addCart = async (req, res) => {
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(400).send({ message: "Authentication failed" });
        }

        const customer_id = auth.id;
        let cart = await Cart.findOne({ customer_id, is_active: true });
        if (!cart) {
            cart = new Cart({
                customer_id,
                total_item: 0,
                total_price: 0,
            });
            await cart.save();
        }

        // var listItem = [
        //     { id: 1, qty: 2, price: 10.99 },
        //     { id: 2, qty: 1, price: 5.99 },
        //     { id: 3, qty: 3, price: 8.99 }
        // ];
        const listItem = req.body.listItem;
        if (listItem && Array.isArray(listItem)) {
            var cartItems = await Promise.all(listItem.map(async (item) => {
                const { id, qty } = item;
                const product = await Product.findById(id);
                const price = product.price;

                const cartItem = await CartItem.findOne({cart_id: cart.id, product_id: id});
                if (cartItem) {
                    cartItem.qty += qty;
                    cartItem.total_price = cartItem.price * cartItem.qty;
                    await cartItem.save();
                    return cartItem;
                } else {
                    const total_price = price * qty;
                    const newCartItem = new CartItem({
                        cart_id: cart.id,
                        product_id: id,
                        qty,
                        price,
                        total_price,
                    });
    
                    return newCartItem.save();
                }
            }));
            cart.total_item += listItem.length;
            cart.total_price += cartItems.reduce((acc, curr) => acc + curr.total_price, 0);
            await cart.save();
        }

        res.status(200).send({ message: "Cart initialized successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.getCart = async (req, res) => {
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        const { id: customer_id } = auth;

        const cart = await Cart.findOne({ customer_id, is_active: true });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cartItems = await CartItem.find({ cart_id: cart._id });

        res.status(200).json({ cart, cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        const cartItemId = req.params.id;

        const cartItem = await CartItem.findOneAndDelete({ _id: cartItemId });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Cart item deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
};
