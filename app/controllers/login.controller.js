const bcrypt = require("bcrypt");
const authMethod = require('./auth.method');
const jwtVariable = require('../../variables/jwt');
const { SALT_ROUNDS } = require('../../variables/auth');
const db = require("../models");
const Customer = db.customer;
const Admin = db.admin;

exports.login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    try {
        // Find account
        const data = await Customer.findOne({ email: req.body.email });

        if (!data) {
            return res.status(401).send({
                message: `Customer not found with email ${req.body.email}.`
            });
        }

        // Check password
        const isPasswordValid = bcrypt.compareSync(req.body.password, data.hash_password);
        if (!isPasswordValid) {
            return res.status(401).send({
                message: `Incorrect password.`
            });
        }

        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
        const dataForAccessToken = {
            id: data.id,
            email: data.email,
            name: data.name,
            class: data.class,
            role: data.role,
        };
        const accessToken = await authMethod.generateToken(
            dataForAccessToken,
            accessTokenSecret,
            accessTokenLife,
        );
        if (!accessToken) {
            return res.status(500).send({
                message: `Create token failed.`
            });
        }

        const refreshTokenLife = process.env.ACCESS_TOKEN_LIFE || jwtVariable.refreshTokenLife;
        const refreshTokenSecret = process.env.ACCESS_TOKEN_SECRET || jwtVariable.refreshTokenSecret;
        const refreshToken = await authMethod.generateToken(
            dataForAccessToken,
            refreshTokenSecret,
            refreshTokenLife,
        );

        return res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "An error occurred while processing your request."
        });
    }

};

exports.register = async (req, res) => {
    try {
        // Check if request body is empty
        if (!req.body) {
            return res.status(400).send({ message: "Content can not be empty!" });
        }

        // Find account by email
        const customer = await Customer.findOne({ email: req.body.email });

        if (customer) {
            return res.status(401).send({
                message: `Customer already exists with email ${req.body.email}.`,
            });
        }

        console.log(req.body);
        // Hash password
        const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);

        // Create a new customer
        const newCustomer = new Customer({
            email: req.body.email,
            hash_password: hashPassword,
            name: req.body.name,
            class: req.body.class,
            role: req.body.role,
        });

        // Save the new customer to the database
        const savedCustomer = await newCustomer.save();

        res.send(savedCustomer);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "An error occurred while processing your request.",
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        if (!req.body.page) {
            return res.status(400).send({ message: "Content can not be empty!" });
        }

        // Get refresh token from body
        const refreshTokenFromBody = req.body.refreshToken;
        if (!refreshTokenFromBody) {
            return res.status(400).send('Refresh token not found.');
        }

        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || jwtVariable.refreshTokenSecret;

        const decodedRefresh = await authMethod.decodeToken(refreshTokenFromBody, refreshTokenSecret);
        if (!decodedRefresh) {
            return res.status(400).send('Invalid refresh token.');
        }

        const email = decodedRefresh.payload.email;
        var customer;
        var admin;
        if (req.body.page === 'user') {
            customer = await Customer.findOne({ email });
            if (!customer) {
                return res.status(401).send({
                    message: `Customer not found with email ${email}.`,
                });
            }
        } else {
            admin = await Admin.findOne({ email });
            if (!admin) {
                return res.status(401).send({
                    message: `Admin not found with email ${email}.`,
                });
            }
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

        var dataForAccessToken;
        if (customer) {
            // Create new access token
            dataForAccessToken = {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                class: customer.class,
                role: admin.role,
            };
        } else {
            dataForAccessToken = {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                class: admin.class,
                role: admin.role,
            };
        }

        const accessToken = await authMethod.generateToken(dataForAccessToken, accessTokenSecret, accessTokenLife);
        if (!accessToken) {
            return res.status(400).send('Failed to create access token, please try again.');
        }

        return res.json({
            accessToken,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: 'An error occurred while processing your request.',
        });
    }
};
