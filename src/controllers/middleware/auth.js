const jwtFactory = require('../../services/Auth/Strategies/Jwt');

const loggedInMiddleware = (req, res, next) => {
  if (!req.headers.jwt) {
    return res.status(401)
      .json({ message: 'Not authorised' });
  }

  const jwt = jwtFactory(req.app, req.app.get('app_config'));
  const jwtPayload = jwt.verify(req.headers.jwt);

  if (!jwtPayload._id) {
    return res.status(401)
      .json({ message: 'Not authorised' });
  }

  req.app.getModel('user')
    .findOne({ _id: jwtPayload._id }, (err, user) => {
      if (err) {
        return res.status(404)
          .json({ message: 'User not found' });
      }

      if (!err && user) {
        req.user = user;
        req.isLoggedIn = true;
      }

      return next();
    });
};

const apiMiddleware = (req, res, next) => {
  if (!req.headers['api-token']) {
    return res.status(401).json({ message: 'Not authorised' });
  }

  const User = req.app.getModel('user');
  User.findOne({ 'settings.redisApiKey': req.headers['api-token'] })
    .then(user => {
      if (!user) {
        throw new Error(`Could not find user with API key`);
      }

      req.user = user;
      req.isLoggedIn = true;
      return next();
    })
    .catch(() => {
      return res.status(401).json({ message: 'Not authorised' });
    });
};

module.exports = { loggedInMiddleware, apiMiddleware };
