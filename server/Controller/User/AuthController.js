const usermodel = require('../../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PASS = process.env.PASS;
const nodemailer = require('nodemailer');
const textflow = require("textflow.js");
const { isValidPhoneNumber, parsePhoneNumber } = require('libphonenumber-js');

textflow.useKey('JvlPkiAbXej0ZfoTibTeivyehdibSWaRHyEE6VeeNQbmnYmGqcI1y4HtdFy1x6Iv'); // Replace with your actual API key

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Enter all fields" });
        }

        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValidate = await bcrypt.compare(password, user.password);
        if (isValidate) {
            const { password, ...userWithoutPassword } = user.toObject();

            const accessToken = jwt.sign(
                { email: email, userId: user._id },
                process.env.ACCESS_TOKEN,
                { expiresIn: '1d' }
            );

            res.status(200).json({
                accessToken,
                user: {
                    userId: user._id,
                    name: user.name,
                    mobileno: user.mobileno,
                    email: user.email,
                }
            });
        } else {
            res.status(400).json({ message: "Enter valid Password" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password, mobileno } = req.body;

        if (!name || !email || !password || !mobileno) {
            return res.status(400).json({ message: "Enter all the fields" });
        }

        const user = await usermodel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashpwd = await bcrypt.hash(password, 10);

        await usermodel.create({ name, password: hashpwd, email, mobileno });

        res.status(200).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if the phone number is provided
        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        // Validate and format the phone number using libphonenumber
        let parsedPhoneNumber;
        try {
            parsedPhoneNumber = parsePhoneNumber(phoneNumber); // Parse the phone number
        } catch (error) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        // If the phone number is not valid
        if (!parsedPhoneNumber.isValid()) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        // Format the phone number to international format
        const formattedPhoneNumber = parsedPhoneNumber.formatInternational(); // e.g., "+917397475123"
        const normalizedPhoneNumber = formattedPhoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
        const finalPhoneNumber = `+${normalizedPhoneNumber}`; // Ensure it starts with '+'

        // Check if the user exists in the database with the normalized number
        let user = await usermodel.findOne({ mobileno: finalPhoneNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Configure options for TextFlow's OTP generation
        const verificationOptions = {
            sender: 'MyCompany',                       // Replace with your sender ID or phone number
            message: `Your verification code is {otp}`,  // TextFlow replaces {otp} with the actual OTP
            expires: 3600                              // OTP expires in 1 hour (3600 seconds)
        };

        textflow.sendVerificationSMS(finalPhoneNumber, verificationOptions, async (error, data) => {
            // Check if `error` is a success response instead of an actual error
            const response = error || data; // Use `error` if it's not null, else `data`
            
            if (response && response.ok && response.status === 200) {
                const otp = response.data.verification_code; // Extract OTP from the response
                console.log("OTP generated:", otp);
        
                // Save TextFlow's OTP and expiration time in the database
                user.otpToken = otp;
                user.otpExpire = Date.now() + 3600000; // 1 hour from now
                await user.save();
        
                console.log("OTP saved to database:", user);
                return res.status(200).json({
                    message: "OTP sent successfully to your phone",
                    otpDetails: {
                        otp, // For debugging purposes, you can omit this in production
                        expiresIn: verificationOptions.expires
                    }
                });
            } else {
                console.error("Failed to send OTP:", response);
                return res.status(500).json({
                    message: "Failed to send OTP via SMS",
                    errorDetails: response
                });
            }
        });
        

    } catch (error) {
        console.error("Error generating OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const Verifyotp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }

        const user = await usermodel.findOne({ mobileno: phoneNumber });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        if (user.otpToken === otp) {
            // Clear OTP data and mark user as verified
            user.otpToken = null;
            user.otpExpire = null;
            user.verified = true;
            await user.save();

            return res.status(200).json({ message: "OTP verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
    const { email } = req.body;

    function generateOTP() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    try {
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = generateOTP();


        // Save the token and expiration time to the user document
        user.resetPwdToken = token;
        user.resetPwdExpire = Date.now() + 3600000; // Expire after 1 hour

        user.resetPwdExpire = Date.now() + 3600000; 

        // Save the changes to the user document
        await user.save();


        // Create a transporter object to send the email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "dharaneedharanchinnusamy@gmail.com",
                pass: PASS
            }
        });

        // Define the email options
        const mailOptions = {
            from: "dharaneedharanchinnusamy@gmail.com",
            to: user.email,
            subject: "Password Reset Request",
            text: `Hello ${user.name},\n\nYou requested to reset your password. Please use the following token to reset your password:\n\n${token}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nYour App Team`
        };


        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending password reset email:", error);
                return res.status(500).json({ message: "Failed to send password reset email" });
            }

            console.log("Password reset email sent:", info.response, token);
            res.status(200).json({ message: "Password reset email sent" });
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
} 

const respassword = async (req, res) => {
    const { token, pwd } = req.body;
    if (!token || !pwd) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        const user = await usermodel.findOne({
            resetPwdToken: token,
            resetPwdExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }
        if (pwd.length < 6) {
            return res.status(400).json({ message: "Password is too short. It must be at least 6 characters long." });
        }
        const hashedPassword = await bcrypt.hash(pwd, 10);

        user.password = hashedPassword;
        user.resetPwdToken = null;
        user.resetPwdExpire = null;
        await user.save();

        console.log("Password reset successfully");
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        // Fetch all users and exclude sensitive fields
        const users = await usermodel.find().select('-password -resetPwdToken -resetPwdExpire -otpToken -otpExpire');
        
        if (!users.length) {
            return res.status(404).json({ 
                message: 'No users found'
            });
        }

        res.status(200).json({
            message: 'Users retrieved successfully',
            users
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    login,
    register,
    gtpOtps,
    resetPassword,
    Verifyotp,
    respassword,
    getUsers
}
module.exports = { login, register, getOtp, resetPassword, Verifyotp, respassword };
