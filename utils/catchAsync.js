module.exports = catchAsync = fn => {
  return function(req, res, next) {
    fn(req, res, next).catch(next); //NOTE: like than catch(err => next(err));
  };
};
