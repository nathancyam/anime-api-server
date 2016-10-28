/**
 * Created by nathanyam on 11/04/2014.
 */
"use strict";

const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

try {
  const configPath = argv.config;
  const isAbsolute = configPath[0] === '/';
  const realConfigPath = isAbsolute ? configPath : `${__dirname}/${configPath}`;
  let configFile = fs.readFileSync(realConfigPath).toString();
  module.exports = JSON.parse(configFile);
} catch (err) {
  console.error(err);
  process.exit(1);
}
