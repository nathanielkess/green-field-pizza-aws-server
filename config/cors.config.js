/**
 * config to enable defined headers and methods to be accepted on the server
 * @param {*} _ request express instance
 * @param {*} res - response express instance
 */
const allowCrossDomain = (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', '*');
  next();
}

module.exports = allowCrossDomain;