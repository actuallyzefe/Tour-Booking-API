const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const review = await Review.find();
  res.status(200).json({
    status: 'Success',
    results: review.length,
    data: review,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // FOR NESTED ROUTES
  if (!req.body.tour) req.body.tour = req.params.tourId; // eğer body içerisine özellikle belirtmemişsek URLde bulunan param ı kullan
  if (!req.body.user) req.body.user = req.user.id; // aynısnı ama burada req.user ı => protect middlewareden aldık

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: newReview,
  });
});
