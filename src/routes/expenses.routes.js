import { Router } from 'express';
import {
    addExpense,
    getExpenses,
    getExpense,
    getExpensesByCategory
} from '../controllers/expense.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = new Router();

//Private routes
// router.post('/', protect, addExpense);
// router.get('/', protect, getExpenses);
//alternate way
router.route('/').post(protect, addExpense).get(protect, getExpenses);

//Query params
router.get('/:id', protect, getExpense);
router.get('/category/:id', protect, getExpensesByCategory);

export default router;
