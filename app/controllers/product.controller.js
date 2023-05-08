const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require("../models");
const Product = db.product;

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
        // Check body product
        if (!req.body.name || !req.body.category_id || !req.body.price) {
            return res.status(400).send({ message: "Name, category_id, and price are required fields." });
        }

        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).send({ message: err.message });
            }

            // Create a new product
            const product = new Product({
                name: req.body.name,
                category_id: req.body.category_id,
                detail: req.body.detail || null,
                price: req.body.price,
                image: req.file ? req.file.filename : null,
                is_active: req.body.is_active || true
            });

            const savedProduct = await product.save();
            res.status(201).send(savedProduct);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.getList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.getListByCategory = async (req, res) => {
    try {
        const products = await Product.find({category_id: req.params.id});
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Product not found." });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        if (error.kind === "ObjectId") {
            return res.status(404).send({ message: "Product not found." });
        }
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send({ message: `Product with id ${id} not found` });
        }

        // Update fields
        product.name = req.body.name || product.name;
        product.category_id = req.body.category_id || product.category_id;
        product.detail = req.body.detail || product.detail;
        product.price = req.body.price || product.price;
        product.is_active = req.body.is_active || product.is_active;

        // Save changes
        await product.save();

        // Return updated product
        res.send(product);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).send({ message: "Product not found." });
        }
        res.status(200).send({ message: "Product deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};
