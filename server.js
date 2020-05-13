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

app.post('/payment/create', async (req, res) => {
  console.log('its here')
  const data = req.body;
  const isHoldCharge = data.isChargingLater;
  let costumerId;

  stripe.customers.create(
	{
	  description: 'anom',
	},
	(err, customer) => {
		if (err) {
			return res.status(500).send({
				error: err.message
			});
		} else {
		   costumerId = customer.id
		   console.log('err', err, 'inside of else customer', customer)
		   console.log('after customer', costumerId)
			try {
				stripe.paymentIntents.create({
					amount: data.total,
					payment_method_types: ['card'],
					currency: 'cad',
					customer: costumerId,
					off_session:isHoldCharge,
					confirm: isHoldCharge,
					metadata: {
						'name': data.name,
						'hour': data.hour,
						'addressDelivery': data.addressDelivery,
					}
				}).then((paymentIntent) => {
					console.log('paymentIntent err', paymentIntent)
					return res.status(200).send({
						publishableKey: publicKey,
						clientSecret: paymentIntent.client_secret
					});
				});
			} catch (err) {
				console.log(err)
			}
		}
	})
});

app.post('/payment/confirm', async (req, res) => {
    const data = req.body;
    const cardDetail = req.body.cardDetail
    const paymentId = req.body.paymentId

    console.log('data', data);


	// first call customer - list
	// get paymentMenthod from the list
	// confirm passing in the confir
	// https://stripe.com/docs/api/payment_methods/list
    stripe.paymentIntents.confirm(paymentId, {
      payment_method: cardDetail,
    }, (err, paymentIntent) => {
      if (err) {
          return res.status(500).send({
            error: err.message
          });
       }
        return res.status(200).send({ paymentIntent });
      }
    );
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

app.get('/recent-charges', async (req, res) => {
  const limit = req.query.limit || 3;
  stripe.charges.list(
    {limit},
    function(err, charges) {
      if (err) {
        return res.status(500).send({
          error: err.message
        });
      }
      return res.send({charges});
    }
  );
})

app.post('/create-charge', async (req, res) => {

  const data = req.body;
  const token = data.token;

  console.log('token is', {token})

  try {
    const charge = await stripe.charges.create({
      amount: 999,
      currency: 'usd',
      description: 'Example charge',
      source: token.id, //<-- just the ID: https://github.com/zandoan/turing-frontend/issues/38
      capture: false,
    });
    res.status(200).send('charge created');

  } catch (err) {
    console.log('create charge error!', {err})
    res.status(500).send({err});
  }

});

app.post('/capture-charge', async (req, res) => {
  const data = req.body;
  chargeId = data.chargeId;
  console.log('charge id', { chargeId });
  try {
    const charge = await stripe.charges.capture(chargeId);
    res.status(200).send({
      message: 'charge confirmed',
      charge: charge
    });
  } catch (error) {
    res.status(500).send({
      message: 'error capturing charge',
      error: error
    })
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
