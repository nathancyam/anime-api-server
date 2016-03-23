/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const mongoose = require('mongoose');
const path = require('path');

module.exports = (app, httpServer) => {
  const modelDirectory = path.join(__dirname, 'models');
  const helperDirectory = path.join(__dirname, 'helpers');

  console.log('Binding model helpers...');
  mongoose.connect(app.get('app_config').mongo);

  app.getModel = modelString => {
    return require(`${modelDirectory}/${modelString}`);
  };

  app.getHelper = helperString => {
    return require(`${helperDirectory}/${helperString}`);
  };

  console.log('Binding services...');
  require('./services/registrar')(app, httpServer);

  console.log('Parsing routes...');
  require('./routes')(app);
};