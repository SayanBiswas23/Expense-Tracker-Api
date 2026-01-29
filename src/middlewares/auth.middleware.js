import jwt from 'jsonwebtoken';
import { pool } from '../config/db.config.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(404).send({
                msg: 'jwtToken not found',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query(
            `SELECT user_id, username FROM users where user_id = $1`,
            [decoded.id]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({
                msg: 'User not found , Invalid login Credentials',
            });
        }
        req.user = user.rows[0];
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            msg: 'failed db fetch, Invalid token detected',
        });
    }
};
