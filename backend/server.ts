import dotenv from 'dotenv';
dotenv.config();

import express, {  Request, Response } from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

import connectDB  from "./GeneralConfig/db";
import apiRouter from './authentication/api';
import authRouter from './authentication/api_auth';


const PORT = 8000;
const app = express();



app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true              
}));

app.use(cookieParser());

app.use(express.json());

connectDB();

app.get('/', (_req: Request, res: Response) => {
  res.send('✅ Internship Tracker API is up');
});

app.use('/auth', authRouter);
app.use('/', apiRouter);



app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));