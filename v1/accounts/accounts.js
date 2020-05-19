exports.routesAccountConfig = (app) => {

  app.get('/accounts/recent', async (req, res) => {
    const queryLimit = req.query.limit || 5;

    stripe.accounts.list(
      { limit: queryLimit },
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
  
};