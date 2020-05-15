const express = require('express');
const bodyParser = require('body-parser');
const corsConfig = require('./cors.config');

const app = express();

app.use(bodyParser.json());
app.use(corsConfig);

module.exports = app;