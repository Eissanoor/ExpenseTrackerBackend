const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Get MongoDB URL and remove any surrounding quotes if present
let MONGODB_URL = process.env.MONGODB_URL;



mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((e) => console.log(e));
