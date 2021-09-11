const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./APIFeatures');

exports.deleteOne = model =>
  catchAsync(async function(req, res, next) {
    await model.findByIdAndDelete(req.params.id);
    res.status(200).json();
  });
exports.updateOne = model =>
  catchAsync(async function(req, res, next) {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) return next('now doc found with this id');
    res.status(200).json({
      status: 'succeed',
      data: {
        doc
      }
    });
  });

exports.createOne = model =>
  catchAsync(async function(req, res, next) {
    console.log('omar fareed');
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc
      }
    });
  });
exports.getOne = (model, popOptions) =>
  catchAsync(async function(req, res, next) {
    let query = model.findById(req.params.id);
    if (query && popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;
    // UNDERSTAND: why pre not post?
    // .populate('guides') // NOTE: means fulfil this field which reference to it
    // .populate({ path: 'guides', select: '-__v -passwordChangedAt' });
    if (!query) return next(new appError('No tour found with that id', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });
exports.getAll = model =>
  catchAsync(async function(req, res, next) {
      // to allow nested queries {hack}
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // UNDERSTAND:
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      num : doc.length,
      data: {
        doc
      }
    });
  });