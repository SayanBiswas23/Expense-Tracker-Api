import { pool } from '../config/db.config.js';

//@desc     Add new Expense
//@route    POST api/expenses
//@access   Private

export const addExpense = async (req, res) => {
    const { amount, category_id, description, date } = req.body;
    const userID = req.user.user_id;

    if (!amount) {
        return res.status(400).json({
            msg: 'Amount is required',
        });
    }
    try {
        const newExpense = await pool.query(
            `INSERT INTO expenses (user_id, category_id, amount, description, date) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                userID,
                category_id || null,
                amount,
                description,
                date || new Date(),
            ]
        );

        res.status(201).json(newExpense.rows[0]);
    } catch (error) {
        return res.status(500).json({
            msg: `Server error ${error.message}`,
        });
    }
};

//@desc     Get all Expenses
//@route    GET api/expenses
//@access   Private

export const getExpenses = async (req, res) => {
    const UserID = req.user.user_id;

    try {
        const expenses = await pool.query(
            // `SELECT e.*, c.name as category_name
            // FROM expenses e
            // LEFT JOIN categories c ON e.category_id = c.category_id
            // WHERE e.user_id = $1 ORDER BY e.date DESC`,

            `SELECT 
                e.expense_id, 
                e.amount, 
                e.date, 
                e.description, 
                e.category_id, 
                c.name as category_name 
            FROM expenses e 
            LEFT JOIN categories c ON e.category_id = c.category_id 
            WHERE e.user_id = $1 
            ORDER BY e.expense_id `,
            [UserID]
        );

        if (expenses.rows.length === 0) {
            return res.status(404).json({
                msg: `No expenses found for this user`,
            });
        }

        res.status(200).json(expenses.rows);
    } catch (error) {
        return res.status(500).json({
            msg: `Server error ${error.message}`,
        });
    }
};

//@desc     Get single Expenses
//@route    GET api/expenses:id
//@access   Private
export const getExpense = async (req, res) => {
    const userID = req.user.user_id;
    const { id } = req.params;

    try {
        const expense = await pool.query(
            `SELECT 
                e.*, 
                c.name as category_name 
            FROM expenses e 
            LEFT JOIN categories c ON e.category_id = c.category_id
            WHERE e.user_id = $1 AND e.expense_id = $2`,
            // `SELECT * FROM expenses WHERE user_id = $1 AND expense_id = $2`,
            [userID, id]
        );

        if (expense.rows.length === 0) {
            return res.status(404).json({
                msg: 'Expense not found',
            });
        }
        res.status(200).json(expense.rows[0]);
    } catch (error) {
        return res.status(500).json({
            msg: `Server error ${error.message}`,
        });
    }
};

//@desc     Get Expenses by Category
//@route    GET api/expenses:id (category)
//@access   Private

export const getExpensesByCategory = async (req, res) => {
    const userID = req.user.user_id;
    const { id } = req.params;

    try {
        const expensesByCategory = await pool.query(
            `SELECT 
                e.expense_id, 
                e.amount, 
                e.date, 
                e.description, 
                c.name AS category_name
            FROM expenses e
            JOIN categories c ON e.category_id = c.category_id
            WHERE e.user_id = $1 AND e.category_id = $2
            ORDER BY e.date DESC; `,
            [userID, id]
        );
        if (expensesByCategory.rows.length === 0) {
            return res.status(404).json({
                msg: `No expenses found for this category`,
            });
        }
        res.status(200).json(expensesByCategory.rows);
    } catch (error) {
        return res.status(500).json({
            msg: `Server error ${error.message}`,
        });
    }
};
