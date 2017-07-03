const router = require('express').Router();

function EpisodeRouter(loggedInMiddleware, apiMiddleware) {

  router.get('/anime/:id', loggedInMiddleware, async (req, res) => {
    const animeId = req.params.id;
    try {
      const result = await req.app.getModel('episode').find({ anime: animeId });
      return res.send(result);
    } catch (err) {
      return res.status(500).send(err);
    }
  });

  router.post('/download', apiMiddleware, (req, res) => {
    const cmdFactory = req.app.get('command');
    const episodeCmd = cmdFactory.create('episode_download', req.body.filename);

    return req.app.get('bus')
      .handle(episodeCmd)
      .then(episode => {
        return res.json({ status: 'SUCCESS', message: 'Episode saved', episode: episode });
      })
      .catch(err => {
        return res.statusCode(500).json({ status: 'ERROR', err: err.message });
      });
  });

  router.get('/', loggedInMiddleware, (req, res) => {
    req.app.getModel('episode')
      .find((err, results) => {
        res.send(results);
      });
  });

  return router;
}

module.exports = EpisodeRouter;
