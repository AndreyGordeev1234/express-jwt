import 'dotenv/config';
import express from 'express';
import { createConnection } from 'typeorm';
import { router } from './routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

(async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      credentials: true,
    }),
  );
  app.use(cookieParser());

  await createConnection();

  app.use(router);

  app.listen(process.env.PORT || 5000, () => {
    console.log('Server started');
  });
})();
