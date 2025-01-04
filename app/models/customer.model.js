module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            email: {
                type: String,
                unique: true,
            },
            hash_password: {
                type: String,
            },
            name: {
                type: String,
            },
            class: {
                type: String,
            },
            role: {
                type: String,
            },
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Customer = mongoose.model("customer", schema);
    return Customer;
};
