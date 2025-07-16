import { handleError } from "../helpers/handleError.js";
import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Enhanced Register Controller
export const Register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return next(handleError(400, 'All fields are required'));
        }

        // Check existing user with timeout
        const checkuser = await User.findOne({ email })
            .maxTimeMS(10000)
            .catch(err => {
                throw new Error('Database query timed out');
            });

        if (checkuser) {
            return next(handleError(409, 'User already registered'));
        }

        // Hash password
        const hashedPassword = bcryptjs.hashSync(password, 12);

        // Create user
        const user = new User({
            name, 
            email, 
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Register Error:', error);
        next(handleError(500, error.message));
    }
};

// Enhanced Login Controller
export const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user with timeout
        const user = await User.findOne({ email })
            .select('+password')
            .maxTimeMS(10000)
            .catch(err => {
                throw new Error('Database query timed out');
            });

        if (!user) {
            return next(handleError(404, 'Invalid login credentials'));
        }

        // Compare passwords
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return next(handleError(404, 'Invalid login credentials'));
        }

        // Generate JWT
        const token = jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set cookie
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            user: userResponse,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login Error:', error);
        next(handleError(500, error.message));
    }
};

// Enhanced Google Login Controller
export const GoogleLogin = async (req, res, next) => {
    try {
        const { name, email, avatar } = req.body;

        // Find or create user with retry logic
        let user;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                user = await User.findOne({ email })
                    .maxTimeMS(10000);

                if (!user) {
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = bcryptjs.hashSync(randomPassword, 12);
                    
                    user = new User({
                        name,
                        email,
                        password: hashedPassword,
                        avatar
                    });

                    await user.save();
                }
                break;
            } catch (err) {
                attempts++;
                if (attempts === maxAttempts) throw err;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            }
        }

        // Generate JWT
        const token = jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set cookie
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            user: userResponse,
            message: 'Google login successful'
        });

    } catch (error) {
        console.error('Google Login Error:', error);
        next(handleError(500, 'Authentication failed. Please try again.'));
    }
};

// Logout Controller
export const Logout = (req, res, next) => {
    try {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout Error:', error);
        next(handleError(500, error.message));
    }
};