const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require("../models");
const Category = db.category;

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
        // Check category name in body
        if (!req.body.name) {
            return res.status(400).send({ message: "Category name is required." });
        }

        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).send({ message: err.message });
            }

            // Create a new category
            const category = new Category({
                name: req.body.name,
                image: req.file ? req.file.filename : null
            });

            const savedCategory = await category.save();
            res.status(201).send(savedCategory);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.getList = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send({ message: "Category not found." });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        if (error.kind === "ObjectId") {
            return res.status(404).send({ message: "Category not found." });
        }
        res.status(500).send({ message: "An error occurred while processing your request." });
    }
};
