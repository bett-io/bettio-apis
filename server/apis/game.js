import { findGame } from '../db/game';

const file = 'server/apis/game.js';

const getGame = (req, res) => {
  req.log.info({ file, function: 'getGame', req: { url: req.url } });

  findGame(req.log, req.params.id)
    .then((game) => res.send(game))
    .catch((error) => {
      req.log.error({ file, function: 'getGame', error });
      res.status(403).send(error);
    });
};

export default (app) => {
  app.get('/game/:id', getGame);
};
