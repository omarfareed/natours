// const fs = require('fs'),
//     data = fs.readFileSync(`./dev-data/data/tours.json`),
//     tours = JSON.parse(data);
const Tour = require('../models/tourModel'),
  APIFeatures = require('./APIFeatures'),
  catchAsync = require('./../utils/catchAsync'),
  factory = require('./handlerFactory'),
  appError = require('./../utils/appError');
// middle ware function
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image please upload only images', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  console.log(req.files.imageCover);
  await sharp(req.files.imageCover[0].buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i}.jpeg`;
      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );
  next();
});
exports.aliasTopTours = (req, _, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  // console.log('here');
  next();
};
exports.getAllTours = factory.getAll(Tour);
exports.postNewTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' }); // Aggregiation
exports.getToursStats = catchAsync(async function(req, res, next) {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        sumRatings: { $sum: '$price' },
        avgRating: { $avg: '$price' }
      }
    },
    {
      $sort: { price: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: stats
  });
});
exports.editTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latLng, unit } = req.params;
  const [lat, lng] = latLng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Error in coordinates, please provide lat , lng in format lat,lang'
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    status: 'success',
    tours
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latLng, unit } = req.params;
  const [lat, lng] = latLng.split(',');
  const distanceMultiplier = unit === 'mi' ? 0.000621371 : 0.001;
  // console.log(lng, lat);
  if (!lat || !lng) {
    next(
      new AppError(
        'Error in coordinates, please provide lat , lng in format lat,lang'
      )
    );
  }
  // UNDERSTAND:
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat]
        },
        distanceField: 'distance',
        distanceMultiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    distances
  });
});
