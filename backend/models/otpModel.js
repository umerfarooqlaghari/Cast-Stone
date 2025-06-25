const mongoose = require("mongoose");
const { Schema } = mongoose;

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otpCode: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("Otp", otpSchema);
