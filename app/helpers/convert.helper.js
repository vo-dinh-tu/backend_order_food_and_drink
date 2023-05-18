const db = require("../models");
const Cart = db.cart;
const CartItem = db.cartItem;
const Order = db.order;
const OrderItem = db.orderItem;

exports.convertCartToOrder = async (cartId, typeOrder) => {
    const cart = await Cart.findById(cartId);
    if (!cart || !cart.is_active) {
        return false;
    }

    const newOrder = new Order({
        cart_id: cart.id,
        customer_id: cart.customer_id,
        total_item: cart.total_item,
        total_price: cart.total_price,
        status: "NEW",
        type_order: typeOrder,
        is_payment: false,
        is_active: true,
    });
    const saveNewOrder = await newOrder.save();

    const cartItems = await CartItem.find({ cart_id: cartId });
    await Promise.all(
        cartItems.map(async (item) => {
            const newOrderItem = new OrderItem({
                order_id: saveNewOrder.id,
                product_id: item.product_id,
                product_name: item.product_name,
                product_image: item.product_image,
                qty: item.qty,
                price: item.price,
                total_price: item.total_price,
                is_active: item.is_active,
            });
            await newOrderItem.save();
        })
    );
    cart.is_active = false;
    await cart.save();

    // create cart
    const newCart = new Cart({
        customer_id: cart.customer_id,
        total_item: 0,
        total_price: 0,
        is_active: true,
    });
    await newCart.save();


    return saveNewOrder;
};
