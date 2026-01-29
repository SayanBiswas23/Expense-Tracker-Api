//todo custom error handler and async wrapper fn

import { pool } from '../config/db.config.js';
//@desc     Add new Category
//@route    POST api/categories
//@access   Private

export const addCategory = async (req, res) => {
    const { name } = req.body;
    const userID = req.user.user_id;

    if (!name) {
        return res.status(400).json({
            msg: 'Category name is required',
        });
    }

    try {
        const newCategory = await pool.query(
            `INSERT INTO categories (name, user_id) values ($1,$2) RETURNING *`,
            [name, userID]
        );

        res.status(201).json(newCategory.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            // Postgres Unique Violation
            return res.status(400).json({ msg: 'Category already exists' });
        }
        res.status(500).json({
            msg: `Server error ${error.message}`,
        });
    }
};

//@desc     get all Categories
//@route    GET api/categories
//@access   Private

export const getCategories = async (req, res) => {
    const userID = req.user.user_id;

    try {
        const categories = await pool.query(
            `SELECT * FROM categories where user_id = $1`,
            [userID]
        );
        if (categories.rows.length === 0) {
            return res.status(400).json({
                msg: 'No categories found for this user',
            });
        }

        res.status(200).json(categories.rows);
    } catch (error) {
        res.status(500).json({
            msg: `Server error ${error.message}`,
        });
    }
};

//todo get category by ID
