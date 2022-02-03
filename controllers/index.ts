import express from 'express';
import usersRouter from './users';
import authRouter from './auth';
import gamesRouter from './games';
import consolesRouter from './consoles';

const setupRoutes = (app: express.Application) => {
  app.use('/utilisateurs', usersRouter);
  app.use('/login', authRouter);
  app.use('/jeux', gamesRouter);
  app.use('/consoles', consolesRouter);
};

export default setupRoutes;
