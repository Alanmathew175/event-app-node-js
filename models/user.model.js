const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    phone_number: {
        type: String,
        // required: true,
        trim: true,
        minLength: 10,
    },
    refresh_token: {
        type: String,
        trim: true,
    },
});
module.exports = mongoose.model("users", userSchema);
