const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const privateKey = 'sk_test_8FjVn29BuWNOIgiRlTKmYAml001BwLtPmH';
const publicKey = 'pk_test_rKarX4mhDwJwrWlfc6yUnoQh00qraD4ezM';


const stripe = require('stripe')(privateKey);

const app = express();


app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.get('/hello-world', (req, res) => {
  console.log('go here');
  return res.status(200).send('Hello World!');
});

app.post('/create-payment-intent', async (req, res) => {
  const data = req.body;
  

  await stripe.paymentIntents.create({
    amount: 3500,
    payment_method_types: ['card'],
    currency: 'cad',
    metadata: {
      'name': data.name,
      'hour': data.hour,
      'addressDelivery': data.addressDelivery,
    }
  }).then((paymentIntent) => {
    try {
      return res.send({
        publishableKey: publicKey,
        clientSecret: paymentIntent.client_secret
      });
    } catch (err) {
      return res.status(500).send({
        error: err.message
      });
    }
  });
});

app.get('/recent-accounts', async (_, res) => {
  stripe.accounts.list(
    {limit: 10},
    (err, accounts) => {
      if (err) {
        return res.status(500).send({
          error: err.message
        });
      }
      return res.send({accounts});
    }
  );
});

app.get('/recent-payment-intents', async (req, res) => {
  const limit = req.query.limit || 3;
  console.log('limit is', limit);
  stripe.paymentIntents.list(
    {limit}, 
    (err, paymentIntents) => {
      if (err) {
        return res.status(500).send({
          error: err.message
        });
      }
      return res.send({paymentIntents})
    }
  );
})

// exports.app = functions.https.onRequest(app);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});