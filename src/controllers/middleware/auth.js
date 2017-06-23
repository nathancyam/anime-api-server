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

module.exports = { loggedInMiddleware };
