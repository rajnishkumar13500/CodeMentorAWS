const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/DynamoUser');
const Otp = require('../models/DynamoOtp');
const { sendOtpEmail } = require('../utils/emailService');

/**
 * Generate a 6-digit OTP
 */
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate JWT token
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.email, email: user.email }, // Use email as ID for DynamoDB
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
}

/**
 * POST /auth/register
 * Register a new user and send OTP for email verification
 */
exports.register = async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password || !displayName) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        // If user exists but not verified, delete old record to allow re-registration
        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ email: existingUser.email });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (unverified)
        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            displayName,
            isVerified: false,
        });
        await user.save();

        // Generate and save OTP
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        await Otp.deleteMany({ email: email.toLowerCase() }); // Clear old OTPs
        await new Otp({ email: email.toLowerCase(), otp: hashedOtp }).save();

        // Send OTP email
        await sendOtpEmail(email, otp);

        res.status(201).json({
            message: 'Registration successful. Please verify your email with the OTP sent.',
            email: email.toLowerCase(),
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

/**
 * POST /auth/verify-otp
 * Verify email with OTP and return JWT
 */
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find the latest OTP for this email
        const otpRecord = await Otp.findOne({ email: email.toLowerCase() });
        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark user as verified
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clean up OTPs
        await Otp.deleteMany({ email: email.toLowerCase() });

        // Generate JWT
        const token = generateToken(user);

        res.json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user.email,
                email: user.email,
                displayName: user.displayName,
            },
        });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

/**
 * POST /auth/resend-otp
 * Resend OTP to email
 */
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate and save new OTP
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        await Otp.deleteMany({ email: email.toLowerCase() });
        await new Otp({ email: email.toLowerCase(), otp: hashedOtp }).save();

        // Send OTP email
        await sendOtpEmail(email, otp);

        res.json({ message: 'OTP resent successfully' });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ message: 'Server error while resending OTP' });
    }
};

/**
 * POST /auth/login
 * Login with email and password
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Email not verified. Please verify your email first.',
                needsVerification: true,
                email: user.email,
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.email,
                email: user.email,
                displayName: user.displayName,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

/**
 * GET /auth/me
 * Get current user from JWT
 */
exports.getMe = async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                displayName: req.user.displayName,
                photo: req.user.photo,
                createdAt: req.user.createdAt,
            },
        });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
