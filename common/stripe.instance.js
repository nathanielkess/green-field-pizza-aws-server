const { PRIVATE_KEY } = require('./stripe.constants')
console.log('set up private key', PRIVATE_KEY);

const stripe = require('stripe')(PRIVATE_KEY);

module.exports = stripe;