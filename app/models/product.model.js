module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: {
            type: String,
            unique: true,
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },
        detail: {
            type: String,
            null: true,
        },
        price: {
            type: Number,
        },
        image: {
            type: String,
            null: true,
        },
        is_active: {
            type: Boolean,
            default: true
        },

      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Product = mongoose.model("product", schema);
    return Product;
  };
