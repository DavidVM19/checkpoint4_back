import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IUserInfo from '../interfaces/IUserInfo';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const calculateToken = (userPseudo = '', userId = 0, userIsAdmin = 0) => {
  return jwt.sign(
    { pseudo: userPseudo, id: userId, admin: userIsAdmin },
    process.env.PRIVATE_KEY as string
  );
};

interface ICookie {
  user_token: string;
}

const userConnected = (req: Request, res: Response, next: NextFunction) => {
  const myCookie = req.cookies as ICookie;
  if (!myCookie.user_token) {
    next(new ErrorHandler(401, 'Unauthorized, please connect'));
  } else {
    req.userInfo = jwt.verify(
      myCookie.user_token,
      process.env.PRIVATE_KEY as string
    ) as IUserInfo;
    if (req.userInfo === undefined) {
      next(new ErrorHandler(401, 'Unauthorized, please connect'));
    } else {
      next();
    }
  }
};

const userIsAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.userInfo === undefined || !req.userInfo.admin) {
    next(new ErrorHandler(403, 'Forbidden'));
  } else {
    next();
  }
};

export { calculateToken, userConnected, userIsAdmin };
