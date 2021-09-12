// NOTE: it must be at the top of the code so that it works synchronously
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION shutting down......');
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});
const mongoose = require('mongoose'),
  dotenv = require('dotenv'),
  app = require('./app');
dotenv.config({ path: './conf.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const connect = async function() {
  const con = await mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
};
connect();
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log('listening on port ' + port);
});

// NOTE: this function handles only errors occur in asynchronous code
process.on('unhandledRejection', function(err) {
  console.log(err.name, err.message);
  console.log('un-handled rejection Shutting down!');
  server.close(() => {
    process.exit(1);
  });
});
