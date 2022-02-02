import connection from '../db-config.js';
import { ResultSetHeader } from 'mysql2';
import Joi from 'joi';
import argon2, { Options } from 'argon2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IUser from '../interfaces/IUser';

const validateUser = (req: Request, res: Response, next: NextFunction) => {
  let presence: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    presence = 'required';
    req.file;
  }
  const errors = Joi.object({
    id: Joi.number(),
    id_user: Joi.number(),
    pseudo: Joi.string().max(25).presence(presence),
    lastname: Joi.string().max(255).presence(presence),
    firstname: Joi.string().max(255).presence(presence),
    email: Joi.string().max(255).presence(presence),
    password: Joi.string().min(8).max(200).presence(presence),
    birthday_date: Joi.date().presence(presence),
    phone: Joi.number(),
    picture: Joi.string().max(255),
    wallet: Joi.number(),
    playstation_account: Joi.string().max(200),
    xbox_account: Joi.string().max(200),
    nintendo_account: Joi.string().max(200),
    steam_account: Joi.string().max(200),
    is_admin: Joi.number().integer().min(0).max(1),
    country: Joi.string().max(100),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const recordExists = (req: Request, res: Response, next: NextFunction) => {
  void (async () => {
    const user = req.body as IUser;
    user.id_user = parseInt(req.params.idUser);
    const recordFound: IUser = await getById(user.id_user);
    if (!recordFound) {
      next(new ErrorHandler(404, `User not found`));
    } else {
      next();
    }
  })();
};
const emailIsFree = (req: Request, res: Response, next: NextFunction) => {
  void (async () => {
    const user = req.body as IUser;
    const userWithSameEmail: IUser = await getByEmail(user.email);
    if (userWithSameEmail && userWithSameEmail.id_user !== req.body.id_user) {
      next(new ErrorHandler(409, `Email already exists`));
    } else {
      next();
    }
  })();
};
const pseudoIsFree = (req: Request, res: Response, next: NextFunction) => {
  void (async () => {
    const user = req.body as IUser;
    const userWithSamePseudo: IUser = await getByPseudo(user.pseudo);
    if (userWithSamePseudo && userWithSamePseudo.id_user !== req.body.id_user) {
      next(new ErrorHandler(409, `Pseudo already exists`));
    } else {
      next();
    }
  })();
};

const hashingOptions: Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (password: string): Promise<string> => {
  return argon2.hash(password, hashingOptions);
};

const verifyPassword = (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return argon2.verify(hashedPassword, password, hashingOptions);
};

// <------------------ models ----------------------->

const getAll = (
  sortBy: string,
  order: string,
  firstItem: string,
  limit: string
): Promise<IUser[]> => {
  let sql = `SELECT *, id_user as id FROM utilisateurs`;

  if (!sortBy) {
    sql += ` ORDER BY id_user ASC`;
  }
  if (sortBy) {
    sql += ` ORDER BY ${sortBy} ${order}`;
  }
  if (limit) {
    sql += ` LIMIT ${limit} OFFSET ${firstItem}`;
  }
  return connection
    .promise()
    .query<IUser[]>(sql)
    .then(([results]) => results);
};

const getById = (idUser: number): Promise<IUser> => {
  return connection
    .promise()
    .query<IUser[]>('SELECT * FROM utilisateurs WHERE id_user = ?', [idUser])
    .then(([results]) => results[0]);
};

const getByEmail = (email: string): Promise<IUser> => {
  return connection
    .promise()
    .query<IUser[]>('SELECT * FROM utilisateurs WHERE email = ?', [email])
    .then(([results]) => results[0]);
};

const getByPseudo = (pseudo: string): Promise<IUser> => {
  return connection
    .promise()
    .query<IUser[]>('SELECT * FROM utilisateurs WHERE pseudo = ?', [pseudo])
    .then(([results]) => results[0]);
};

const getByCountry = (country: string): Promise<IUser> => {
  return connection
    .promise()
    .query<IUser[]>('SELECT * FROM utilisateurs WHERE country = ?', [country])
    .then(([results]) => results[0]);
};

const getByPhone = (phone: number): Promise<IUser> => {
  return connection
    .promise()
    .query<IUser[]>('SELECT * FROM utilisateurs WHERE phone = ?', [phone])
    .then(([results]) => results[0]);
};

const create = async (newUser: IUser): Promise<number> => {
  const hashedPassword = await hashPassword(newUser.password);
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO utilisateurs (pseudo, firstname, lastname, email, hash_password, birthday_date, phone, picture, wallet, playstation_account, xbox_account, nintendo_account, steam_account, is_admin, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newUser.pseudo,
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        hashedPassword,
        newUser.birthday_date,
        newUser.phone,
        newUser.picture,
        newUser.wallet,
        newUser.playstation_account,
        newUser.xbox_account,
        newUser.nintendo_account,
        newUser.steam_account,
        newUser.is_admin,
        newUser.country,
      ]
    )
    .then(([results]) => results.insertId);
};

const update = async (
  idUser: number,
  attibutesToUpdate: IUser
): Promise<boolean> => {
  let sql = 'UPDATE utilisateurs SET ';
  const sqlValues: Array<string | number | Date> = [];
  let oneValue = false;
  if (attibutesToUpdate.pseudo) {
    sql += ' pseudo = ? ';
    sqlValues.push(attibutesToUpdate.pseudo);
    oneValue = true;
  }
  if (attibutesToUpdate.firstname) {
    sql += oneValue ? ', firstname = ? ' : ' firstname = ? ';
    sqlValues.push(attibutesToUpdate.firstname);
    oneValue = true;
  }
  if (attibutesToUpdate.lastname) {
    sql += oneValue ? ', lastname = ? ' : ' lastname = ? ';
    sqlValues.push(attibutesToUpdate.lastname);
    oneValue = true;
  }
  if (attibutesToUpdate.email) {
    sql += oneValue ? ', email = ? ' : ' email = ? ';
    sqlValues.push(attibutesToUpdate.email);
    oneValue = true;
  }
  if (attibutesToUpdate.password) {
    const hash_password = await hashPassword(attibutesToUpdate.password);
    sql += oneValue ? ', hash_password = ? ' : ' hash_password = ? ';
    sqlValues.push(hash_password);
    oneValue = true;
  }
  if (attibutesToUpdate.birthday_date) {
    sql += oneValue ? ', birthday_date = ? ' : ' birthday_date = ? ';
    sqlValues.push(attibutesToUpdate.birthday_date);
    oneValue = true;
  }
  if (attibutesToUpdate.phone) {
    sql += oneValue ? ', phone = ? ' : ' phone = ? ';
    sqlValues.push(attibutesToUpdate.phone);
    oneValue = true;
  }
  if (attibutesToUpdate.picture) {
    sql += oneValue ? ', picture = ? ' : ' picture = ? ';
    sqlValues.push(attibutesToUpdate.picture);
    oneValue = true;
  }
  if (attibutesToUpdate.wallet) {
    sql += oneValue ? ', wallet = ? ' : ' wallet = ? ';
    sqlValues.push(attibutesToUpdate.wallet);
    oneValue = true;
  }
  if (attibutesToUpdate.playstation_account) {
    sql += oneValue
      ? ', playstation_account = ? '
      : ' playstation_account = ? ';
    sqlValues.push(attibutesToUpdate.playstation_account);
    oneValue = true;
  }
  if (attibutesToUpdate.xbox_account) {
    sql += oneValue ? ', xbox_account = ? ' : ' xbox_account = ? ';
    sqlValues.push(attibutesToUpdate.xbox_account);
    oneValue = true;
  }
  if (attibutesToUpdate.nintendo_account) {
    sql += oneValue ? ', nintendo_account = ? ' : ' nintendo_account = ? ';
    sqlValues.push(attibutesToUpdate.nintendo_account);
    oneValue = true;
  }
  if (attibutesToUpdate.steam_account) {
    sql += oneValue ? ', steam_account = ? ' : ' steam_account = ? ';
    sqlValues.push(attibutesToUpdate.steam_account);
    oneValue = true;
  }
  if (attibutesToUpdate.is_admin) {
    sql += oneValue ? ', is_admin = ? ' : ' is_admin = ? ';
    sqlValues.push(attibutesToUpdate.is_admin);
    oneValue = true;
  }
  if (attibutesToUpdate.country) {
    sql += oneValue ? ', country = ? ' : ' country = ? ';
    sqlValues.push(attibutesToUpdate.country);
    oneValue = true;
  }
  sql += ' WHERE id_user = ? ';
  sqlValues.push(idUser);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const destroy = (idUser: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM utilisateurs WHERE id_user = ?', [
      idUser,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export {
  getAll,
  getById,
  getByEmail,
  getByPseudo,
  getByCountry,
  getByPhone,
  create,
  update,
  destroy,
  verifyPassword,
  validateUser,
  recordExists,
  pseudoIsFree,
  emailIsFree,
};
