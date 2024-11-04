const db = require("../models");
const Admin = db.admin;
const middlewares = require("./auth.middlewares");


exports.getStaff = async (req, res) => {
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(400).send({ message: "Authentication failed" });
        }
        const staffs = await Admin.find({ role: "STAFF" });
        res.send(staffs);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    const id = req.params.id;
    try {
        const auth = await middlewares.checkAuth(req);
        if (!auth) {
            return res.status(400).send({ message: "Authentication failed" });
        }
        await Admin.findByIdAndDelete(id);
        res.status(200).send({ message: "Staff deleted successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}