const bcrypt = require("bcrypt");
const authMethod = require('./auth.method');
const jwtVariable = require('../../variables/jwt');
const { SALT_ROUNDS } = require('../../variables/auth');
const db = require("../models");
const Customer = db.customer;

exports.login = async (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.page) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    if (req.body.page === 'user') {
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
                firstName: data.first_name,
                lastName: data.last_name,
                phone: data.phone,
                age: data.age,
                gender: data.gender,
                avatar: data.avatar,
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
    } else {
        return res.status(400).send({
            message: "Invalid page parameter."
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

        // Check password confirmation
        if (req.body.password !== req.body.confirm_password) {
            return res.status(400).send({
                message: "Password confirmation does not match!",
            });
        }

        // Hash password
        const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);

        // Create a new customer
        const newCustomer = new Customer({
            email: req.body.email,
            hash_password: hashPassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone,
            gender: req.body.gender,
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
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).send({
                message: `Customer not found with email ${email}.`,
            });
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

        // Create new access token
        const dataForAccessToken = {
            id: customer.id,
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            phone: customer.phone,
            age: customer.age,
            gender: customer.gender,
            avatar: customer.avatar,
        };

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

