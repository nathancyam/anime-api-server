/**
 * Created by nathanyam on 18/03/2016.
 */

"use strict";

module.exports = (app, httpServer) => {
  console.log('Binding model helpers...');
  require('./models/registrar')(app);

  console.log('Binding services...');
  require('./services/registrar')(app, httpServer);

  console.log('Parsing routes...');
  require('./routes')(app);
};