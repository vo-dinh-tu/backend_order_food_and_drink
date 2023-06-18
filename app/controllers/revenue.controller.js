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
            for (let i = 0; i < arrayMonth.length; i++) {
                const year = parseInt(arrayMonth[i].split("-")[0]);
                const month = parseInt(arrayMonth[i].split("-")[1]);
                const startDate = new Date(year, month - 1, 1); 
                const endDate = new Date(year, month, 1);
        
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
    
                result.push([arrayMonth[i],totalRevenue]);
            }
    
            res.status(200).send({ result });
        } else if (typeRevenue === "Year") {
            for (let i = 0; i < arrayYear.length; i++) {
                const startDate = new Date(parseInt(arrayYear[i]), 0, 1);
                const endDate = new Date(parseInt(arrayYear[i]) + 1, 0, 1);
        
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
    
                result.push([arrayYear[i],totalRevenue]);
            }
    
            res.status(200).send({ result });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

