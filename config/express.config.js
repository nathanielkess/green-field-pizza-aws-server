const express = require('express');
const bodyParser = require('body-parser');
const corsConfig = require('./cors.config');
// routes
const PaymentRouter = require('../stripe/payment')

const app = express();

app.use(bodyParser.json());
app.use(corsConfig);

PaymentRouter.routesPaymentIntentConfig(app);

module.exports = app;