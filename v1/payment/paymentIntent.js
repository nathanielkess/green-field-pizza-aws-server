const stripe = require('../../common/stripe.instance');
const { 
  PAYMENT_CURRENCY, 
  PI_FUTURE_USAGE, 
  PI_PIZZAGROUP, 
  PAYMENT_CARD,
  DELIVERY_DRIVER_FEE,
  DEFAULT_USERNAME
} = require('./payment.constants');

exports.routesPaymentIntentConfig = (app) => {
  app.get('/hello-world', (_, res) => {
    return res.status(200).send('Hello World!');
  });

  app.post('/payment/create', async (req, res) => {
    const data = req.body;
    const isHoldCharge = data.isChargingLater;
    let costumerId;

    stripe.customers.create(
      {
        description: DEFAULT_USERNAME,
        payment_method: data.paymentMethodId
      },
      (err, customer) => {
        if (err) {
          return res.status(500).send({
            error: err.message
          });
        } else {
          costumerId = customer.id
          try {
            stripe.paymentIntents.create({
              setup_future_usage: PI_FUTURE_USAGE.off,
              amount: data.total,
              payment_method_types: PAYMENT_CARD,
              currency: PAYMENT_CURRENCY,
              customer: costumerId,
              off_session: isHoldCharge,
              confirm: isHoldCharge,
              payment_method: data.paymentMethodId,
              metadata: {
                name: data.name,
                hour: data.hour,
                addressDelivery: data.addressDelivery,
              },
            }).then(err, paymentIntent => {
              if (paymentIntent.code || err) {
                return res.status(500).send({
                  error: paymentIntent.message
                });
              }
              return res.status(200).send({
                publishableKey: process.env.PUBLIC_KEY,
                clientSecret: paymentIntent.client_secret
              });
            });
          } catch (err) {
            return res.status(500).send({
              error: err.message
            });
          }
        }
      })
  });

  app.post('/payment/split', async (req, res) => {
    const data = req.body;
    const { paymentId, destinationAccountId } = data;

    await stripe.paymentIntents.update(paymentId, {
      transfer_group: PI_PIZZAGROUP,
    }, (error, _) => {
      if (error) {
        console.log('inside if')
         return res.status(500).send({ message: "params missing" }) 
      }

      stripe.transfers.create({
        amount: DELIVERY_DRIVER_FEE,
        currency: PAYMENT_CURRENCY,
        destination: destinationAccountId,
        transfer_group: PI_PIZZAGROUP,
      }).then((result) => {
        res.status(200).send({ result });
      }).catch((error) => {
        return res.status(500).send({ error })
      })

    })
  })


  app.post('/payment/confirm', async (req, res) => {
    const data = req.body;
    const { paymentId } = data;

    stripe.paymentIntents.confirm(paymentId, {}, (err, paymentIntent) => {
      if (err) {
        return res.status(500).send({
          error: err.message
        });
      }
      return res.status(200).send({ paymentIntent });
    });


  });

  app.get('/recent-accounts', async (_, res) => {
    stripe.accounts.list(
      { limit: 10 },
      (err, accounts) => {
        if (err) {
          return res.status(500).send({
            error: err.message
          });
        }
        return res.status(200).send({ accounts });
      }
    );
  });

  app.get('/recent-payment-intents', async (req, res) => {
    const limit = req.query.limit || 3;

    stripe.paymentIntents.list(
      { limit },
      (err, paymentIntents) => {
        if (err) {
          return res.status(500).send({
            error: err.message
          });
        }
        return res.status(200).send({ paymentIntents })
      }
    );
  })

};