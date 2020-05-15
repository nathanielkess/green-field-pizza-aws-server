require('dotenv').config()

const server = require('./config/express.config');

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
