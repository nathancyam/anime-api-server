/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

const mongoose = require('mongoose');

module.exports = (app) => {
  mongoose.connect(app.get('app_config').mongo);

  const modelDirectory = __dirname;

  app.getModel = modelString => {
    return require(`${modelDirectory}/${modelString}`);
  };
};