import { Request, Response, NextFunction, Router } from 'express';
import * as Lobbie from '../models/lobbie';
import ILobbie from '../interfaces/ILobbie';
import * as Auth from '../helpers/auth';
import { ErrorHandler } from '../helpers/errors';

const lobbiesRouter = Router();

lobbiesRouter.get(
  '/',
  Auth.userConnected,
  Auth.userIsAdmin,
  (req: Request, res: Response, next: NextFunction) => {
    const sortBy = req.query.sortBy as string;
    const order = req.query.order as string;
    const firstItem = req.query.firstItem as string;
    const limit = req.query.limit as string;

    Lobbie.getAll(sortBy, order, firstItem, limit)
      .then((lobbies: Array<ILobbie>) => {
        res.setHeader(
          'Content-Range',
          `addresses : 0-${lobbies.length}/${lobbies.length + 1}`
        );
        res.status(200).json(lobbies);
      })
      .catch((err) => next(err));
  }
);

lobbiesRouter.get(
  '/:idLobbie',
  (req: Request, res: Response, next: NextFunction) => {
    const { idLobbie } = req.params;
    Lobbie.getById(Number(idLobbie))
      .then((lobbie: ILobbie) => {
        if (lobbie === undefined) {
          res.status(404).send('Lobbie not found');
        }
        res.status(200).json(lobbie);
      })
      .catch((err) => next(err));
  }
);

lobbiesRouter.get(
  '/:idUserLocal',
  (req: Request, res: Response, next: NextFunction) => {
    const { idUserLocal } = req.params;
    Lobbie.getByIdUserLocal(Number(idUserLocal))
      .then((userLocal: ILobbie) => {
        if (userLocal === undefined) {
          res.status(404).send('User Local not found');
        }
        res.status(200).json(userLocal);
      })
      .catch((err) => next(err));
  }
);

lobbiesRouter.get(
  '/:idUserAway',
  (req: Request, res: Response, next: NextFunction) => {
    const { idUserAway } = req.params;
    Lobbie.getByIdUserAway(Number(idUserAway))
      .then((userAway: ILobbie) => {
        if (userAway === undefined) {
          res.status(404).send('User Away not found');
        }
        res.status(200).json(userAway);
      })
      .catch((err) => next(err));
  }
);

lobbiesRouter.get(
  '/:idGameConsole',
  (req: Request, res: Response, next: NextFunction) => {
    const { idGameConsole } = req.params;
    Lobbie.getByIdGameConsole(Number(idGameConsole))
      .then((gameConsole: ILobbie) => {
        if (gameConsole === undefined) {
          res.status(404).send('Game console not found');
        }
        res.status(200).json(gameConsole);
      })
      .catch((err) => next(err));
  }
);

lobbiesRouter.post(
  '/',
  Lobbie.validateLobbie,
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const lobbie = req.body as ILobbie;
        lobbie.id_lobbie = await Lobbie.create(lobbie);
        res.status(201).json(lobbie);
      } catch (err) {
        next(err);
      }
    });
  }
);

lobbiesRouter.put(
  '/:idLobbie',
  Auth.userConnected,
  Lobbie.validateLobbie,
  (req: Request, res: Response) => {
    void (async () => {
      const { idLobbie } = req.params;

      const lobbieUpdated = await Lobbie.update(
        Number(idLobbie),
        req.body as ILobbie
      );
      if (lobbieUpdated) {
        res.status(200).send(req.body);
      } else {
        throw new ErrorHandler(500, `Lobbie can't be updated`);
      }
    })();
  }
);

lobbiesRouter.delete(
  '/:idLobbie',
  Auth.userConnected,
  Auth.userIsAdmin,
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const { idLobbie } = req.params;
        const lobbieDeleted = await Lobbie.destroy(Number(idLobbie));
        if (lobbieDeleted) {
          res.status(200).send('Lobbie deleted');
        } else {
          throw new ErrorHandler(404, `Lobbie not found`);
        }
      } catch (err) {
        next(err);
      }
    })();
  }
);

export default lobbiesRouter;
