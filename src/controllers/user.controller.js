import jwt from 'jsonwebtoken';
import { pool } from '../config/db.config.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

//cookie options
const cookieOptions = {
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
};

//token genration fn
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(401).send({ msg: 'Information not provided' });
    }
    //todo warning here password:expose
    // FIXME: console.log(password);
    
    try {
        const userExists = await pool.query(
            `SELECT user_id FROM USERS WHERE email = $1`,
            [email]
        );

        if (userExists.rows.length > 0) {
            console.log(
                `[Registration] Pre-check: Email ${email} already exists.`
            ); // Flag/Log for tracking
            return res.status(409).json({
                msg: 'User already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING user_id,email`,
            [name, email, hashedPassword]
        );

        const token = generateToken(newUser.rows[0].user_id);

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            msg: 'User registered Successfully',
            token: token,
        });
    } catch (error) {
        if (error.code === '23505') {
            console.warn(
                `[Registration] User with email ${email} already exists.`
            );
            return res.status(400).json({
                msg: 'User already exists',
            });
        }
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Login a user
// @route   POST /api/users/login
// @access  Public

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Inadequate field details');
    }

    try {
        const userData = await pool.query(
            `SELECT * FROM users WHERE email =$1`,
            [email]
        );
        if (userData.rows.length === 0) {
            return res.status(400).json({
                msg: 'Invalid Credentials',
            });
        }

        const user = userData.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                msg: 'Invalid email or password',
            });
        }

        const token = generateToken(user.user_id);

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            user: { id: user.user_id, name: user.username, email: user.email },
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Get a user
// @route   GET /api/users/
// @access  Private

export const getUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'Not authorized' });
    }
    // Map DB columns (user_id, username) to response format
    const { user_id, username } = req.user;
    return res.status(200).json({ id: user_id, name: username });
};

// @desc    Logout a user
// @route   POST /api/users/logout
// @access  Private

export const logoutUser = async (req, res) => {
    res.cookie('token', '', {
        ...cookieOptions,
        maxAge: 0,
    });

    res.status(200).json({
        msg: 'user logged out successfully',
    });
};
