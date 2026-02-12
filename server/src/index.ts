import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import algorithmRoutes from './routes/algorithms';
import progressRoutes from './routes/progress';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/progress', progressRoutes);



app.get('/api/health', (req, res) => {

    res.json({ status: 'ok', message: 'Algorithm Demonstration Teaching System API is running' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
