const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log(`Database Connected Successfully`))
    .catch((error) => {
      console.error(`Error Connecting to Database:`, error.message);
      process.exit(1);
    });
};
