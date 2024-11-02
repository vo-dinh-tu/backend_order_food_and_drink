const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require("../models");
const middlewares = require("./auth.middlewares");
const SupplyItem = db.supplyItem;
const DIR = 'static/images/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = uuidv4() + '-' + file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});
exports.create = async (req, res) => {
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).send({ message: err.message });
            }

            if (!req.body.name || !req.body.price || !req.body.quantity || !req.body.priceSale) {
                return res.status(400).send({ message: "Name, price, quantity, and priceSale are required fields." });
            }

            const supplyItem = new SupplyItem({
                name: req.body.name,
                exports: 0,
                price: req.body.price,
                priceSale: req.body.priceSale,
                quantity: req.body.quantity,
                image: req.file ? req.file.filename : null,
            });

            const savedSupplyItem = await supplyItem.save();

            res.status(201).send(savedSupplyItem);
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.export = async (req, res) => {
    const id = req.params.id;
    try {

        const supplyItem = await SupplyItem.findById(id);
        if (!supplyItem) {
            return res.status(404).send({ message: "Supply item not found." });
        }

        if (supplyItem.quantity <= 0) {
            return res.status(400).send({ message: "Supply item is out of stock." });
        }
        supplyItem.exports += 1;
        supplyItem.quantity -= 1;
        await supplyItem.save();
        res.status(200).send({ message: "Supply item exported successfully." });


    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
}


exports.update = async (req, res) => {
    const id = req.params.id;
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).send({ message: err.message });
            }
            const supplyItem = await SupplyItem.findById(id);
            if (!supplyItem) {
                return res.status(404).send({ message: "Supply item not found." });
            }
            supplyItem.name = req.body.name || supplyItem.name;
            supplyItem.price = req.body.price || supplyItem.price;
            supplyItem.priceSale = req.body.priceSale || supplyItem.priceSale;
            supplyItem.quantity = req.body.quantity || supplyItem.quantity;
            supplyItem.image = req.file ? req.body.image : supplyItem.image;
            await supplyItem.save();
            res.status(200).send({ message: "Supply item updated successfully." });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
}


exports.getList = async (req, res) => {
    try {
        const supplyItems = await SupplyItem.find();
        res.status(200).json(supplyItems);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
}


exports.getSupplyById = async (req, res) => {
    const id = req.params.id;
    try {
        const supplyItem = await SupplyItem.findById(id);
        if (!supplyItem) {
            return res.status(404).send({ message: "Supply item not found." });
        }
        res.status(200).json(supplyItem);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
}

// delete 

exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        await SupplyItem.findByIdAndDelete(id);
        res.status(200).send({ message: "Supply item deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
}