const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Virtual field for confirmPassword (not stored in DB)
userSchema.virtual('confirmPassword')
  .get(function () {
    return this._confirmPassword;
  })
  .set(function (value) {
    this._confirmPassword = value;
  });

// Password confirmation validation
userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    if (this.password !== this._confirmPassword) {
      this.invalidate('confirmPassword', 'Password and confirmPassword must match');
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
