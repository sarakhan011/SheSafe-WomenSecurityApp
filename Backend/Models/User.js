const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone_number: { type: String, required: true },
    relationship: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email_address: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone_number: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    emergency_contact: { type: [emergencyContactSchema], default: [] },
    password: { type: String, required: true, select: false },
    profile_image: { type: String, default: "" },
    push_token: { type: String, default: "" },
    last_known_location: {
      type: { latitude: Number, longitude: Number },
      default: null,
    },
  },
  { timestamps: true, collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
