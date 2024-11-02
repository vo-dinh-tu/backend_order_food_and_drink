module.exports = mongoose => {
  const supplySchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      priceSale: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
      },
      quantity: {
        type: Number,
        required: true,
      },
      exports: {
        type: Number,
        default: 0,
      },
      is_active: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
      toJSON: {
        transform: (doc, ret) => {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        },
      },
    }
  );

  const SupplyItem = mongoose.model('supply_item', supplySchema);

  return SupplyItem;
};
