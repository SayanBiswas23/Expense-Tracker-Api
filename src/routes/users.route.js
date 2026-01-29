import { Router } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import {
    registerUser,
    loginUser,
    getUser,
    logoutUser,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = new Router();
//__ Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

//__ Protected routes
router.get('/user', protect, getUser);
router.post('/logout', protect, logoutUser);

export default router;
