const db = require("../models");
const Order = db.order;
const ConvertHelper = require("../helpers/convert.helper.js");

exports.calcu = async (req, res) => {
    try {
        const result = [];
        const typeRevenue = req.body.typeRevenue;

        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        const arrayDate = await ConvertHelper.getArrayDate(startDate, endDate, typeRevenue);

        if (typeRevenue === "Date") {
            for (let i = 0; i < arrayDate.length; i++) {
                const startDate = new Date(arrayDate[i]);
                const endDate = new Date(arrayDate[i]);
                endDate.setDate(endDate.getDate() + 1);
    
                const orders = await Order.find({
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                });
    
                let totalRevenue = 0;
                for (const order of orders) {
                    totalRevenue += order.total_price;
                }
    
                result.push([arrayDate[i],totalRevenue]);
            }
    
            res.status(200).send({ result });
        } else if (typeRevenue === "Month") {
            for (let i = 0; i < arrayDate.length; i++) {
                const startDate = new Date(arrayDate[i]); 
                const endDate = new Date(arrayDate[i]);
                endDate.setMonth(endDate.getMonth() + 1);
        
                const orders = await Order.find({
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                });
        
                let totalRevenue = 0;
                for (const order of orders) {
                    totalRevenue += order.total_price;
                }
    
                result.push([arrayDate[i],totalRevenue]);
            }
    
            res.status(200).send({ result });
        } else if (typeRevenue === "Year") {
            for (let i = 0; i < arrayDate.length; i++) {
                const startDate = new Date(arrayDate[i]); 
                const endDate = new Date(arrayDate[i]);
                endDate.setFullYear(endDate.getFullYear() + 1);
        
                const orders = await Order.find({
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                });
        
                let totalRevenue = 0;
                for (const order of orders) {
                    totalRevenue += order.total_price;
                }
    
                result.push([arrayDate[i],totalRevenue]);
            }
    
            res.status(200).send({ result });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

