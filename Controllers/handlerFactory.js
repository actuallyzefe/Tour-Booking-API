// IMPORTANT LESSON

// Burada tüm controllerları düzenleyeceğimiz bir fonkısoyn hazırlayacagız
// bu advanced bir konsepttir ve sonucunda yine fonksıyon ortaya çıkar
// mesela delete işlemi için tourController da bulunan deleteTour yerine burada hazırladıgımızı kullanacağız
// ve bu hazırladıgımız tum controllerlar için geçerli olacak

const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

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

// IMPORTANT LESSON ALERT // normalde getTour da vesaire populate kullnadıgımızdan burası bıraz daha farklı

// ilk olarak query i yaratacagız
// daha sonrasında popOptions varsa eğer onu query e ekleyeceğiz
// daha sonrasında klasik awaitimizi yapacağız
exports.getSpesific = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new appError('No document found with that ID', 404));
    }

    res.json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // ALERT Bu 2 satır To allow nested GET reviews on Tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // console.log(req.query);
    // EXECUDE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query.explain();

    res.status(200).json({
      status: 'success',
      results: docs.length, // olmasına grek yok ama postMan de kaç tane data aldıgımızı gorebılmemız acısından ıyı bır sey
      data: {
        data: docs,
      },
    });
  });
