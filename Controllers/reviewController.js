const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);
// catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const review = await Review.find(filter);
//   res.status(200).json({
//     status: 'Success',
//     results: review.length,
//     data: review,
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  // FOR NESTED ROUTES
  if (!req.body.tour) req.body.tour = req.params.tourId; // eğer body içerisine özellikle belirtmemişsek URLde bulunan param ı kullan
  if (!req.body.user) req.body.user = req.user.id; // aynısnı ama burada req.user ı => protect middlewareden aldık
  next();
};

exports.getSpesificReview = factory.getSpesific(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
