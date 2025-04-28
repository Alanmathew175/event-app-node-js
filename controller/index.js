const Users = require("../models/user.model");
exports.postCreateAccount = async (req, res) => {
    try {
        const { name, email, refresh_token } = req.body;

        // Check if user already exists
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            existingUser.refresh_token = refresh_token;
            await existingUser.save();
            console.log(existingUser);

            return res.status(409).json({ message: "User already exists" });
        }

        // Create a new user
        const user = new Users({ name, email, refresh_token });
        const savedUser = await user.save();

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.putUserProfile = async (req, res) => {
    try {
        const { email } = req.params;
        const { phone_number } = req.body;

        // Check if user exists
        const existingUser = await Users.findOne({ email });
        console.log(existingUser);

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user details
        existingUser.phone_number = phone_number;
        await existingUser.save();

        return res.status(200).json({
            message: "User updated successfully",
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                phone: existingUser.phone_number,
            },
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getUser = async (req, res) => {
    try {
        const { email } = req.params;

        // Check if user exists
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User got successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone_number,
            },
        });
    } catch (error) {
        console.error("Error getting user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.putRefreshToken = async (req, res) => {
    try {
        const { email } = req.params;

        // Check if user exists
        const existingUser = await Users.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user details
        existingUser.refresh_token = null;
        await existingUser.save();

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Error occured", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
