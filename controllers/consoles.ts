import { Request, Response, NextFunction, Router } from 'express';
import * as Console from '../models/console';
import IConsole from '../interfaces/IConsole';
import { ErrorHandler } from '../helpers/errors';

const consolesRouter = Router();

consolesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy = req.query.sortBy as string;
  const order = req.query.order as string;
  const firstItem = req.query.firstItem as string;
  const limit = req.query.limit as string;

  Console.getAll(sortBy, order, firstItem, limit)
    .then((consoles: Array<IConsole>) => {
      res.setHeader(
        'Content-Range',
        `addresses : 0-${consoles.length}/${consoles.length + 1}`
      );
      res.status(200).json(consoles);
    })
    .catch((err) => next(err));
});

consolesRouter.get(
  '/:idConsole',
  (req: Request, res: Response, next: NextFunction) => {
    const { idConsole } = req.params;
    Console.getById(Number(idConsole))
      .then((console: IConsole) => {
        if (console === undefined) {
          res.status(404).send('Console not found');
        }
        res.status(200).json(console);
      })
      .catch((err) => next(err));
  }
);

consolesRouter.post(
  '/',
  Console.nameIsFree,
  Console.validateConsole,
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const console = req.body as IConsole;
        console.id_console = await Console.create(console);
        res.status(201).json(console);
      } catch (err) {
        next(err);
      }
    })();
  }
);

consolesRouter.put(
  '/:idConsole',
  Console.nameIsFree,
  Console.validateConsole,
  (req: Request, res: Response) => {
    void (async () => {
      const { idConsole } = req.params;

      const ConsoleUpdated = await Console.update(
        Number(idConsole),
        req.body as IConsole
      );
      if (ConsoleUpdated) {
        res.status(200).send('Console updated');
      } else if (!ConsoleUpdated) {
        res.status(404).send('Console not found');
      } else {
        throw new ErrorHandler(500, `Console can't be updated`);
      }
    })();
  }
);

consolesRouter.delete(
  '/:idConsole',
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const { idConsole } = req.params;
        const consoleDeleted = await Console.destroy(Number(idConsole));
        if (consoleDeleted) {
          res.status(200).send('Console deleted');
        } else {
          throw new ErrorHandler(404, `Console not found`);
        }
      } catch (err) {
        next(err);
      }
    })();
  }
);

export default consolesRouter;
