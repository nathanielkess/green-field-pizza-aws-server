const { PAYMENT_STATUS } = require('./payment.constants');

  // TODO: make this generic to return payment status 
  // which will be passed dinamically
  // coming from the body/headers of the request
const getPaymentIntentByStatusConfirm = data => data.filter(items => {
  return items.status === PAYMENT_STATUS.confirm_required;
});

module.exports = {
  getPaymentIntentByStatusConfirm
};
