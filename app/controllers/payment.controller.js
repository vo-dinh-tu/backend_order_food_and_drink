const db = require("../models");
const config = require('../config/default.json');
const moment = require('moment');
const crypto = require("crypto");
const convertHelper = require("../helpers/convert.helper.js");


exports.createPaymentUrl = async (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';

        if (!req.body.cartId) {
            return res.status(400).send({ message: "Not cart id" });
        }
        const order = await convertHelper.convertCartToOrder(req.body.cartId, "transfer");

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');

        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const tmnCode = config.vnp_TmnCode;
        const secretKey = config.vnp_HashSecret;
        let vnpUrl = config.vnp_Url;
        const returnUrl = req.body.returnUrl;
        const amount = order.total_price;
        const bankCode = req.body.bankCode;
        const locale = 'vn';
        const currCode = 'VND';
        const vnpParams = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': locale,
            'vnp_CurrCode': currCode,
            'vnp_TxnRef': order.id,
            'vnp_OrderInfo': `Payment for order ID: ${order.id}`,
            'vnp_OrderType': 'other',
            'vnp_Amount': amount * 100,
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };
        if (bankCode !== null && bankCode !== '') {
            vnpParams['vnp_BankCode'] = bankCode;
        }

        const sortedParams = sortObject(vnpParams);

        const querystring = require('qs');
        const signData = querystring.stringify(sortedParams, { encode: false });     
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        sortedParams['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(sortedParams, { encode: false });

        // Return payment URL to client
        res.json({ paymentUrl: vnpUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create payment URL' });
    }
};

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}