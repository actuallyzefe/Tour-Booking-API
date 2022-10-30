const fs = require('fs');
const { request } = require('http');
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

// TOURS
// REFACTORING GET data get etmei mongo ile asyn fonskıyon seklıdne yapabiliriz data get => data/file read/okuma yapma
exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // BUILD QUERY
    // 1A) Filtering LESSON
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // IMPORTANT LESSON
    // STEP 1: We created a copy of the req.query using spread operator const queryObj = {...req.query}

    // STEP 2: We created an array of object that we want to exclude from the query strings const excludedFields = ['page', 'sort', 'limit', 'fileds']

    // STEP 3: We have to loop through the array to exclude what we don't want to consider.

    // excludedFields.forEach(el => delete queryObj[el])
    // console.log(req.query, queryObj);

    // 2B) Advanced Filtering LESSON
    let queryStr = JSON.stringify(queryObj); // replace kullanabılmek adına objectki stringe donsuturduk
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`); // stringleri de normalde mongoDB operotur olan $gte $gt $lt vesaire bunları regular expressionlarla degıstırecegız
    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr)); // Tour.find() bize bir query return edecek ve o query i birçok kez chain edebileceğiz

    // SORTING
    if (req.query.sort) {
      query = query.sort(req.query.sort); // query.sort un içine ise neye gore sıralanmasını sıtedıgmzı belırttık o da  requestin i.indeki querynin içindeki postmande belırttıgımız sorting adı yani price (mesela)
    }
    // EXECUDE QUERY
    const tours = await query;

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
    res.json({
      status: 'success',
      results: tours.length, // olmasına grek yok ama postMan de kaç tane data aldıgımızı gorebılmemız acısından ıyı bır sey
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

// REFACTORING GET SPESIFIC
exports.getSpesificTour = async (req, res) => {
  // console.log(req.params); // params dediği şey urlde : ile belirtilenlerdir

  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  // gçrebilecğin üzeriee idler string olarak gelıyor onun için ufak bi trick yaptık

  // GUARD
  try {
    const tour = await Tour.findById(req.params.id);
    res.json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

// REFACTORING POST
exports.createTour = async (req, res) => {
  // Daha çncesinde classlara benzer sekılde şemalar olusturup onalra gore de documentler olusturmustuk
  // şimdi onun daha basit halini görecegız
  try {
    const newTour = await Tour.create(req.body); // Bu fonksıyon bir promise donduurr bunu then ile handle etmek yerıne butun fonskıyonu async await fonkısyonu halıne getırdık

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: 'Invaild data sent! ',
    });
  }
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
};

// REFACTORING UPDATE // PATCH
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// REFACTORING DELETE
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      message: 'Tour deleted!',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       Status: 'Fail',
//       message: 'MISSING PRICE OR NAME',
//     });
//   }
//   next();
// };
