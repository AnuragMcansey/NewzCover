const mongoose = require("mongoose");

const PlacementSchema = new mongoose.Schema(
  {
    PlacementName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Placement", PlacementSchema);
