import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import notFoundError from './app/error/notFoundError';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes/routes';

import webHookHandlers from './app/helper/webHookHandler';

const app = express();

// app.use(cors({ origin: '*', credentials: true }));
// app.use(cors({ origin: ['http://127.0.0.1:5500', 'http://localhost:3000','http://localhost:3001'], credentials: true }));
app.use(
  cors({
    origin: [
      'http://127.0.0.1:5500',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://www.aspiringlegalnetwork.co.uk',
      'https://admin.aspiringlegalnetwork.co.uk',
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webHookHandlers,
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', router);
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the server!!' });
});

app.use(notFoundError);

app.use(globalErrorHandler);

export default app;
