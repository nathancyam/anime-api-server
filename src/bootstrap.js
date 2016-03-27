/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const mongoose = require('mongoose');
const path = require('path');

module.exports = (app, httpServer) => {
  const modelDirectory = path.join(__dirname, 'models');
  const helperDirectory = path.join(__dirname, 'helpers');

  app.get('console')('Binding model helpers...');
  mongoose.connect(app.get('app_config').mongo);

  app.getModel = modelString => {
    return require(`${modelDirectory}/${modelString}`);
  };

  app.getHelper = helperString => {
    return require(`${helperDirectory}/${helperString}`);
  };

  app.get('console')('Binding services...');
  require('./services/registrar')(app, httpServer);

  app.get('console')('Parsing routes...');
  require('./routes')(app);
};