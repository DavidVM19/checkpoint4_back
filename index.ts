import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { handleError } from './helpers/errors';
import setupRoutes from './controllers';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 8000;

const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:8000', 'http://localhost:8001'],
  credentials: true,
  maxAge: 3600,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

setupRoutes(app);

app.use(handleError);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
