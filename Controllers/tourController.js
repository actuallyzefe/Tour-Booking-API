'use strict';
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const factory = require('./handlerFactory');
const fs = require('fs');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}; // bu kısmın getAllTours dan önce olması önemli // IMPORTANT

// const { request } = require('http');
const Tour = require('./../models/tourModel');
// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

// GUARD GUARD GUARD GUARD
// exports.checkId = (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'FAIL',
//       message: `CAN NOT FIND ID:${req.params.id}`,
//     });
//   }
//   next();
// };

// REFACTORING IMPORTANT
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

// TOURS
// REFACTORING GET data get etmei mongo ile asyn fonskıyon seklıdne yapabiliriz data get => data/file read/okuma yapma
exports.getAllTours = catchAsync(async (req, res, next) => {
  // console.log(req.query);
  // EXECUDE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // BUILD QUERY
  // 1A) FILTERING LESSON
  // const queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach((el) => delete queryObj[el]);

  // // IMPORTANT LESSON
  // // STEP 1: We created a copy of the req.query using spread operator const queryObj = {...req.query}

  // // STEP 2: We created an array of object that we want to exclude from the query strings const excludedFields = ['page', 'sort', 'limit', 'fileds']

  // // STEP 3: We have to loop through the array to exclude what we don't want to consider.

  // // excludedFields.forEach(el => delete queryObj[el])
  // // console.log(req.query, queryObj);

  // // 2B) ADVANCED FILTERING LESSON
  // let queryStr = JSON.stringify(queryObj); // replace kullanabılmek adına objectki stringe donsuturduk
  // queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`); // stringleri de normalde mongoDB operotur olan $gte $gt $lt vesaire bunları regular expressionlarla degıstırecegız
  // // console.log(JSON.parse(queryStr));

  // let query = Tour.find(JSON.parse(queryStr)); // Tour.find() bize bir query return edecek ve o query i birçok kez chain edebileceğiz

  // // 2) SORTING LESSON
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' '); // eğer ki sıralamamızı ıstedıgımız secenkde eşitlik olursa farklı bir kriter belirledik
  //   // console.log(sortBy);
  //   query = query.sort(sortBy); // query = query.sort(req.query.sort); // query.sort un içine ise neye gore sıralanmasını sıtedıgmzı belırttık o da  requestin i.indeki querynin içindeki postmande belırttıgımız sorting adı yani price (mesela)
  // } else {
  //   query = query.sortquery = query.sort('-createdAt name'); // kullanıcı hiçbir sorting belirtmezse default olarak ilk önce en yeni eklenen Tour u görüntüleyecek (normalde -createdAt yazmıstık ama bir buga sebep oldugundan ada gore sıralanmasını istedik)
  // }

  // // 3) LIMITING FIELDS // LESSON // field dediğimiz eşler kullanıcga response olarak datanın gozukecek kısımlarını secmek gibidir
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' '); // burayı tıpkı sortingde yaptıgımız gibi önce postmande belirttik daha somrada query ye atadık
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v'); // bu __v mongoose un kullandıgı ama kullancıyı ılgılendırmeyen bir şey ondan dolayı onun harıcındeki tum datayı default olarak gosterdık
  // }

  // // 4) PAGINATION LESSON => 1-10 a kadar olan makaleler sayfa1 / 11-20 sayfa 2,/ 21-30 sayfa 3
  // const page = req.query.page * 1 /*stringden number a çevirdik*/ || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments(); // eğer ki var olan document sayısından fazla bir şey istendiyse error verecegız
  //   if (skip >= numTours) throw new Error("This page doesn't exist");
  // }

  // // burada da kullanıcının hangı sayfayı ıstedıgınde yapıalcak formulu uyguladık
  // query = query.skip(skip).limit(limit); // skip methodu kac sayfa atlanacagını limit ise oncesınde gordugumuzun aynısı kac result gosterecegını limitliyor

  // console a yansıttgıız req.query aslında tıpkı bıızm kendı elımızle yazıdıgımız objecte benzedıgnden boyle yapıp da kullanabıliriz
  // bu bilgiyi ise postmanden çekiyor

  // const tours = await Tour.find({
  //   duration: 5,
  //   difficulty: 'easy',
  // });

  // Mongoose methodlarıyla yapılmıs halı
  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  // json koduyla send edecebılecegımızzden bahsetmıstım
  // json kodu kullanılırken object ile belirtmeyi unutma!

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length, // olmasına grek yok ama postMan de kaç tane data aldıgımızı gorebılmemız acısından ıyı bır sey
    data: {
      tours: tours,
    },
  });
});

// REFACTORING GET SPESIFIC
exports.getSpesificTour = catchAsync(async (req, res, next) => {
  // console.log(req.params); // params dediği şey urlde : ile belirtilenlerdir

  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  // gçrebilecğin üzeriee idler string olarak gelıyor onun için ufak bi trick yaptık

  // GUARD

  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(new appError('No tour found with that ID', 404));
  }

  res.json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

// REFACTORING POST
exports.createTour = catchAsync(async (req, res, next) => {
  // // Daha çncesinde classlara benzer sekılde şemalar olusturup onalra gore de documentler olusturmustuk
  //   // şimdi onun daha basit halini görecegız
  //   try {
  //     const newTour = await Tour.create(req.body); // Bu fonksıyon bir promise donduurr bunu then ile handle etmek yerıne butun fonskıyonu async await fonkısyonu halıne getırdık
  // try {
  //   // const newTour = new Tour({})
  //   // newTour.save()

  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }

  // kodları comment out yaptık cunku try catch kullanmak yerıne catchAsync adında bır errorhandler yaı-ptık ve başka bir dosya olusturudk

  const newTour = await Tour.create(req.body); // burası yukarıda da yazıyordu hızlıca comment yaparken onu da etmısım
  // burada Tour schemasınını kullanak ve ona ait create() fonksıyonunu kullanarak request elemanına ait bodynin içindeki dataları kullanarak yeni kullancıyı await ettik

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// tours.push(newTour);
// // yeni datamızı yarattık sımdı bunu dosyanın ıcıne yazmamız gerek
// fs.writeFile(
//   `./dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     // 201 dosyaya bir şey eklendı anlamına gelir
//   }
// );
// // console.log(newTour)

// REFACTORING UPDATE // PATCH
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new appError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// REFACTORING DELETE
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new appError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Tour deleted!',
//     data: null,
//   });
// });

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       Status: 'Fail',
//       message: 'MISSING PRICE OR NAME',
//     });
//   }
//   next();
// };;

// LESSON Pipeline Aggregation => Dataları manipule etmemızı saglar
// Bunu sağlayabılmek ıcın bırkac adım gerekli => İlk adım => "stages" adında bir arrayi aggregate()fonksıyonuna pass edıyoruz
// stagesı aggregate() içine tanımlıyoruz ve bunlardan tonlarca var bunların hepsine MongoDB doc undan ulaşabiliriz
// stages object şeklinde yazılır ve başlarına $ konulur
exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // match stage i filter gibidir ve genelde önce yazılır
    },
    {
      $group: {
        // group ise accumulatorleri kullanarak dokumanları grupluyor
        // _id: null, // first thing always need to specify,this is where we gonna specify waht we want the group by. // Null yapma sebebimiz he rşeyi bir grupta toplamak ıstememız
        _id: '$difficulty', // böylelikle de yazdıgımız krıtere gore sıralandı
        numTours: { $sum: 1 },
        numRatings: { $sum: 'ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' }, // $avg mongoDB özel averaj hesaplama operatoru içine de neyın averajını almak sıtedıgımızı " " içinde yazıyoruz
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // burada sorting ederken dikkat etmemız gereken sey groupda tanımaldıgımız field nameleri kullanak olacak // avgPrice: 1 => gittikçe artan sıralam seklı ıcın
    },
    // {
    //   $match: { _id: { $ne: 'easy' } }, // burada da repeat stage yapılabıldıgını goterdık ve $ne => not ecual => easy olan datayı gosterme
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // UNWIND => Deconstructs an array field from the input documents to output a document for each element.
      //  Each output document is the input document with the value of the array field replaced by the element.
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // $month mongoDB date opeartoru => bunun hemen bır ustude yarattıgımız datelerden "MONTH"u seçip alıyor
        numTourStarts: { $sum: 1 }, // hangi ayda kaç tane dur oldugunu gosterıyor ve ona gore 1 eklıyor
        tours: { $push: '$name' }, // Hangi ayda hangi turların oldugunu gosterdık
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // 1 olursa id gözükecek 0 da gözükmeyecek
      },
    },
    {
      $sort: { numTourStarts: -1 }, // bir ayda en çok tura sahip olanın gozukmesını sağladık
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
//.
