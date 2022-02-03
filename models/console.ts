import connection from '../db-config.js';
import { ResultSetHeader } from 'mysql2';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IConsole from '../interfaces/IConsole';

/* ------------------------------------------------Middleware----------------------------------------------------------- */

const validateConsole = (req: Request, res: Response, next: NextFunction) => {
  let presence: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    presence = 'required';
  }
  const errors = Joi.object({
    id: Joi.number(),
    id_console: Joi.number(),
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
    const console = req.body as IConsole;
    const consoleWithSameName: IConsole = await getByName(console.name);
    if (
      consoleWithSameName &&
      consoleWithSameName.id_console !== req.body.id_console
    ) {
      next(new ErrorHandler(409, `Console name already exists`));
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
): Promise<IConsole[]> => {
  let sql = `SELECT *, id_console as id FROM consoles`;

  if (!sortBy) {
    sql += ` ORDER BY id_console ASC`;
  }
  if (sortBy) {
    sql += ` ORDER BY ${sortBy} ${order}`;
  }
  if (limit) {
    sql += ` LIMIT ${limit} OFFSET ${firstItem}`;
  }
  return connection
    .promise()
    .query<IConsole[]>(sql)
    .then(([results]) => results);
};

const getById = (idConsole: number): Promise<IConsole> => {
  return connection
    .promise()
    .query<IConsole[]>('SELECT * FROM consoles WHERE id_console = ?', [
      idConsole,
    ])
    .then(([results]) => results[0]);
};

const getByName = (name: string): Promise<IConsole> => {
  return connection
    .promise()
    .query<IConsole[]>('SELECT * FROM consoles WHERE name = ?', [name])
    .then(([results]) => results[0]);
};

const create = (newConsole: IConsole): Promise<number> => {
  return connection
    .promise()
    .query<ResultSetHeader>('INSERT INTO consoles (name) VALUES (?)', [
      newConsole.name,
    ])
    .then(([results]) => results.insertId);
};

const update = (
  idConsole: number,
  attibutesToUpdate: IConsole
): Promise<boolean> => {
  let sql = 'UPDATE consoles SET ';
  const sqlValues: Array<string | number> = [];

  if (attibutesToUpdate.name) {
    sql += 'name = ? ';
    sqlValues.push(attibutesToUpdate.name);
  }
  sql += ' WHERE id_console = ?';
  sqlValues.push(idConsole);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const destroy = (idConsole: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM consoles WHERE id_console = ?', [
      idConsole,
    ])
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
  validateConsole,
};
