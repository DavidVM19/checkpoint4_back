import { Request, Response, NextFunction, Router } from 'express';
import * as Game from '../models/game';
import IGame from '../interfaces/IGame';
import { ErrorHandler } from '../helpers/errors';

const gamesRouter = Router();

gamesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy = req.query.sortBy as string;
  const order = req.query.order as string;
  const firstItem = req.query.firstItem as string;
  const limit = req.query.limit as string;

  Game.getAll(sortBy, order, firstItem, limit)
    .then((games: Array<IGame>) => {
      res.setHeader(
        'Content-Range',
        `addresses : 0-${games.length}/${games.length + 1}`
      );
      res.status(200).json(games);
    })
    .catch((err) => next(err));
});

gamesRouter.get(
  '/:idGame',
  (req: Request, res: Response, next: NextFunction) => {
    const { idGame } = req.params;
    Game.getById(Number(idGame))
      .then((game: IGame) => {
        if (game === undefined) {
          res.status(404).send('Game not found');
        }
        res.status(200).json(game);
      })
      .catch((err) => next(err));
  }
);

gamesRouter.post(
  '/',
  Game.nameIsFree,
  Game.validateGame,
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const game = req.body as IGame;
        game.id_game = await Game.create(game);
        res.status(201).json(game);
      } catch (err) {
        next(err);
      }
    })();
  }
);

gamesRouter.put(
  '/:idGame',
  Game.nameIsFree,
  Game.validateGame,
  (req: Request, res: Response) => {
    void (async () => {
      const { idGame } = req.params;

      const GameUpdated = await Game.update(Number(idGame), req.body as IGame);
      if (GameUpdated) {
        res.status(200).send('Game updated');
      } else if (!GameUpdated) {
        res.status(404).send('Game not found');
      } else {
        throw new ErrorHandler(500, `Game can't be updated`);
      }
    })();
  }
);

gamesRouter.delete(
  '/:idGame',
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const { idGame } = req.params;
        const gameDeleted = await Game.destroy(Number(idGame));
        if (gameDeleted) {
          res.status(200).send('Game deleted');
        } else {
          throw new ErrorHandler(404, `Game not found`);
        }
      } catch (err) {
        next(err);
      }
    })();
  }
);

export default gamesRouter;
