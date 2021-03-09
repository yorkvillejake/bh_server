const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  secure_port: process.env.SECURE_PORT,
  port: process.env.PORT,
  session_key: process.env.SESSION_CRYPT_KEY,
  secret: process.env.SECRET,

  mongo_url: process.env.MONGO_URL,
};