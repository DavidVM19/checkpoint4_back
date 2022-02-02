import express from 'express';
import usersRouter from './users';
import authRouter from './auth';

const setupRoutes = (app: express.Application) => {
  app.use('/utilisateurs', usersRouter);
  app.use('/login', authRouter);
};

export default setupRoutes;
