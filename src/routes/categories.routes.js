import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
    addCategory,
    getCategories,
} from '../controllers/category.controller.js';

const router = new Router();

//Private access

// router.post('/', protect, addCategory);
// router.get('/', protect, getCategories);

// This is an alternative way to write the routes above using chaining
router.route('/').post(protect, addCategory).get(protect, getCategories);

export default router;
