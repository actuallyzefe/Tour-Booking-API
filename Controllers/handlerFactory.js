// IMPORTANT LESSON

// Burada tüm controllerları düzenleyeceğimiz bir fonkısoyn hazırlayacagız
// bu advanced bir konsepttir ve sonucunda yine fonksıyon ortaya çıkar
// mesela delete işlemi için tourController da bulunan deleteTour yerine burada hazırladıgımızı kullanacağız
// ve bu hazırladıgımız tum controllerlar için geçerli olacak

const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new appError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      message: 'Tour deleted!',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new appError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });
