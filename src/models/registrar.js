/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";


module.exports = (app) => {
  const modelDirectory = __dirname;

  app.getModel = modelString => {
    return require(`${modelDirectory}/${modelString}`);
  };
};