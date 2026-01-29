import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import  { initDB } from './src/config/db.config.js';
import authroutes from './src/routes/users.route.js';
import expenseroutes from './src/routes/expenses.routes.js';
import categoryroutes from './src/routes/categories.routes.js';

const corsOptions = {
    origin: 'http://localhost:3050',
    credentials: true,
    maxAge: 3600,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

const app = express();

//express middleware mount

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
//db connection established

try {
    await initDB();
} catch (err) {
    console.log(err);
    process.exit(1);
}

//routes

app.use('/api/users', authroutes);
app.use('/api/expenses', expenseroutes);
app.use('/api/categories', categoryroutes);

app.get('/', (req, res) => {
    res.send('server is running 🟢🟢🟢');
});

//env PORT variable
const PORT = process.env.PORT || 3050;

app.listen(PORT, () => {
    console.log(`server is listening on PORT ${PORT}`);
});
