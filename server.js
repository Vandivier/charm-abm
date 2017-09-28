/*  file description
 *  try to keep custom server init logic here and boilerplate / lib code in ./bin/www
 */

'use strict'
const express = require('express');
const app = express();
const path = require('path');

// TODO: logging if needed, including a client log service
app.use(express.static(path.join(__dirname, 'src')));

module.exports = app;
