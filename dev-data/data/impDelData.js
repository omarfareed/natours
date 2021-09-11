const mongoose = require('mongoose'),
  dotenv = require('dotenv'),
  fs = require('fs'),
  Tour = require('../../models/tourModel'),
  User = require('../../models/userModel'),
  Review = require('../../models/reviewModel');
dotenv.config({ path: `${__dirname}/../../conf.env` });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('success'));

const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const userData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviewData = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    // console.log(data);
    await Tour.create(tourData);
    await User.create(userData, { validateBeforeSave: false });
    await Review.create(reviewData);
    console.log('created !');
  } catch (er) {
    console.log(er);
    console.log('failed!');
  }
};
const deleteAllData = async () => {
  try {
    console.log('jdas');
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('deleted');
  } catch (er) {
    console.log('failed to delete');
  }
};

if (process.argv[2] === 'import') importData();
else if (process.argv[2] === 'delete') deleteAllData();
