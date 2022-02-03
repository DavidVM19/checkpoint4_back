import connection from '../db-config.js';
import { ResultSetHeader } from 'mysql2';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import ILobbie from '../interfaces/ILobbie';

/* ------------------------------------------------Middleware----------------------------------------------------------- */

const validateLobbie = (req: Request, res: Response, next: NextFunction) => {
  let presence: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    presence = 'required';
  }
  const errors = Joi.object({
    id: Joi.number(),
    id_lobbie: Joi.number(),
    price: Joi.number().presence(presence),
    id_user_local: Joi.number().presence(presence),
    id_user_away: Joi.number().presence(presence),
    id_game_console: Joi.number().presence(presence),
    score_local: Joi.number().presence(presence),
    score_away: Joi.number().presence(presence),
    date: Joi.string().presence(presence),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

/* ------------------------------------------------Models----------------------------------------------------------- */

const getAll = (
  sortBy: string,
  order: string,
  firstItem: string,
  limit: string
): Promise<ILobbie[]> => {
  let sql = `SELECT *, id_lobbie as id FROM lobbies`;

  if (!sortBy) {
    sql += ` ORDER BY id_lobbie ASC`;
  }
  if (sortBy) {
    sql += ` ORDER BY ${sortBy} ${order}`;
  }
  if (limit) {
    sql += ` LIMIT ${limit} OFFSET ${firstItem}`;
  }
  return connection
    .promise()
    .query<ILobbie[]>(sql)
    .then(([results]) => results);
};

const getById = (idLobbie: number): Promise<ILobbie> => {
  return connection
    .promise()
    .query<ILobbie[]>('SELECT * FROM lobbies WHERE id_lobbie = ?', [idLobbie])
    .then(([results]) => results[0]);
};

const getByIdUserLocal = (id_user_local: number): Promise<ILobbie> => {
  return connection
    .promise()
    .query<ILobbie[]>('SELECT * FROM lobbies WHERE id_user_local = ?', [
      id_user_local,
    ])
    .then(([results]) => results[0]);
};

const getByIdUserAway = (id_user_away: number): Promise<ILobbie> => {
  return connection
    .promise()
    .query<ILobbie[]>('SELECT * FROM lobbies WHERE id_user_away = ?', [
      id_user_away,
    ])
    .then(([results]) => results[0]);
};

const getByIdGameConsole = (id_game_console: number): Promise<ILobbie> => {
  return connection
    .promise()
    .query<ILobbie[]>('SELECT * FROM lobbies WHERE id_game_console = ?', [
      id_game_console,
    ])
    .then(([results]) => results[0]);
};

const create = (newLobbie: ILobbie): Promise<number> => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO lobbies (price, id_user_local, id_user_away, id_game_console, score_local, score_away, date) VALUES (?,?,?,?,?,?,?)',
      [
        newLobbie.price,
        newLobbie.id_user_local,
        newLobbie.id_user_away,
        newLobbie.id_game_console,
        newLobbie.score_local,
        newLobbie.score_away,
        newLobbie.date,
      ]
    )
    .then(([results]) => results.insertId);
};

const update = (
  idLobbie: number,
  attibutesToUpdate: ILobbie
): Promise<boolean> => {
  let sql = 'UPDATE lobbies SET ';
  const sqlValues: Array<string | number | Date> = [];
  let oneValue = false;

  if (attibutesToUpdate.price) {
    sql += 'price = ? ';
    sqlValues.push(attibutesToUpdate.price);
  }
  if (attibutesToUpdate.id_user_local) {
    sql += oneValue ? ', id_user_local = ? ' : ' id_user_local = ? ';
    sqlValues.push(attibutesToUpdate.id_user_local);
    oneValue = true;
  }
  if (attibutesToUpdate.id_user_away) {
    sql += oneValue ? ', id_user_away = ? ' : ' id_user_away = ? ';
    sqlValues.push(attibutesToUpdate.id_user_away);
    oneValue = true;
  }
  if (attibutesToUpdate.id_game_console) {
    sql += oneValue ? ', id_game_console = ? ' : ' id_game_console = ? ';
    sqlValues.push(attibutesToUpdate.id_game_console);
    oneValue = true;
  }
  if (attibutesToUpdate.score_local) {
    sql += oneValue ? ', score_local = ? ' : ' score_local = ? ';
    sqlValues.push(attibutesToUpdate.score_local);
    oneValue = true;
  }
  if (attibutesToUpdate.score_away) {
    sql += oneValue ? ', score_away = ? ' : ' score_away = ? ';
    sqlValues.push(attibutesToUpdate.score_away);
    oneValue = true;
  }
  if (attibutesToUpdate.date) {
    sql += oneValue ? ', date = ? ' : ' date = ? ';
    sqlValues.push(attibutesToUpdate.date);
    oneValue = true;
  }
  sql += ' WHERE id_lobbie = ?';
  sqlValues.push(idLobbie);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const destroy = (idLobbie: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM lobbies WHERE id_lobbie = ?', [
      idLobbie,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export {
  getAll,
  getById,
  getByIdUserLocal,
  getByIdUserAway,
  getByIdGameConsole,
  create,
  update,
  destroy,
  validateLobbie,
};
