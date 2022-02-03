import connection from '../db-config.js';
import { ResultSetHeader } from 'mysql2';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IGame from '../interfaces/IGame';

/* ------------------------------------------------Middleware----------------------------------------------------------- */

const validateGame = (req: Request, res: Response, next: NextFunction) => {
  let presence: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    presence = 'required';
  }
  const errors = Joi.object({
    id: Joi.number(),
    id_game: Joi.number(),
    name: Joi.string().max(80).presence(presence),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};
const nameIsFree = (req: Request, res: Response, next: NextFunction) => {
  void (async () => {
    const game = req.body as IGame;
    const gameWithSameName: IGame = await getByName(game.name);
    if (gameWithSameName && gameWithSameName.id_game !== req.body.id_game) {
      next(new ErrorHandler(409, `Game name already exists`));
    } else {
      next();
    }
  })();
};

/* ------------------------------------------------Models----------------------------------------------------------- */

const getAll = (
  sortBy: string,
  order: string,
  firstItem: string,
  limit: string
): Promise<IGame[]> => {
  let sql = `SELECT *, id_game as id FROM jeux`;

  if (!sortBy) {
    sql += ` ORDER BY id_game ASC`;
  }
  if (sortBy) {
    sql += ` ORDER BY ${sortBy} ${order}`;
  }
  if (limit) {
    sql += ` LIMIT ${limit} OFFSET ${firstItem}`;
  }
  return connection
    .promise()
    .query<IGame[]>(sql)
    .then(([results]) => results);
};

const getById = (idGame: number): Promise<IGame> => {
  return connection
    .promise()
    .query<IGame[]>('SELECT * FROM jeux WHERE id_game = ?', [idGame])
    .then(([results]) => results[0]);
};

const getByName = (name: string): Promise<IGame> => {
  return connection
    .promise()
    .query<IGame[]>('SELECT * FROM jeux WHERE name = ?', [name])
    .then(([results]) => results[0]);
};

const create = (newGame: IGame): Promise<number> => {
  return connection
    .promise()
    .query<ResultSetHeader>('INSERT INTO jeux (name) VALUES (?)', [
      newGame.name,
    ])
    .then(([results]) => results.insertId);
};

const update = (idGame: number, attibutesToUpdate: IGame): Promise<boolean> => {
  let sql = 'UPDATE jeux SET ';
  const sqlValues: Array<string | number> = [];

  if (attibutesToUpdate.name) {
    sql += 'name = ? ';
    sqlValues.push(attibutesToUpdate.name);
  }
  sql += ' WHERE id_game = ?';
  sqlValues.push(idGame);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const destroy = (idGame: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM jeux WHERE id_game = ?', [idGame])
    .then(([results]) => results.affectedRows === 1);
};

export {
  getAll,
  getById,
  getByName,
  nameIsFree,
  create,
  update,
  destroy,
  validateGame,
};
