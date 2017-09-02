const file = 'server/apis/ping.js';

export default (app) => {
  app.get('/ping', (req, res) => {
    req.log.info({ file, function:'default', req: { url: req.url } });

    res.send('pong');
  });
};
