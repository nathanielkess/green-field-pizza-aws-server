const stripe = require('../../common/stripe.instance');

exports.routesPaymentIntentConfig = (app) => {
  app.get('/hello-world', (_, res) => {
    console.log('go here');
    return res.status(200).send('Hello World!');
  });

  app.post('/payment/create', async (req, res) => {
    const data = req.body;
    const isHoldCharge = data.isChargingLater;
    let costumerId;

    stripe.customers.create(
      {
        description: 'anom',
        payment_method: data.paymentMethodId
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
              setup_future_usage: 'off_session',
              amount: data.total,
              payment_method_types: ['card'],
              currency: 'cad',
              customer: costumerId,
              off_session: isHoldCharge,
              confirm: isHoldCharge,
              payment_method: data.paymentMethodId,
              metadata: {
                'name': data.name,
                'hour': data.hour,
                'addressDelivery': data.addressDelivery,
              },
            }).then((paymentIntent) => {
              console.log('paymentIntent err', paymentIntent)
              return res.status(200).send({
                publishableKey: process.env.PUBLIC_KEY,
                clientSecret: paymentIntent.client_secret
              });
            });
          } catch (err) {
            console.log(err)
          }
        }
      })
  });

  app.post('/payment/split', async (req, res) => {
    const data = req.body;
    const { paymentId, destinationAccountId } = data;
    console.log({ destinationAccountId });

    stripe.paymentIntents.update(paymentId, {
      transfer_group: 'pizza-item-3'
    }, (error, result) => {
      if (error) { return res.status(500).send({ error }) }
      console.log('result from the update', { result });
      stripe.transfers.create({
        amount: 500,
        currency: 'cad',
        destination: destinationAccountId,
        transfer_group: 'pizza-item-3',
        // source_transaction: paymentId,
      }).then((result) => {
        console.log('result is', { result })
        res.status(200).send('split success!!!!!');
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
    console.log('limit is', limit);
    stripe.paymentIntents.list(
      { limit },
      (err, paymentIntents) => {
        if (err) {
          return res.status(500).send({
            error: err.message
          });
        }
        return res.send({ paymentIntents })
      }
    );
  })

};