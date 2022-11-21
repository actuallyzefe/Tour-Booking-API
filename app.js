// const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

// SECURITY
const rateLimit = require('express-rate-limit'); // AYNI IPDEN COK FAZLA REQUEST GELIRSE BU REQUESTLERI BLOCKLAYACAK
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// ERRORS
const appError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');

// ROUTES
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');

const app = express();
// const mongoose = require('mongoose');

// GLOBAL MIDDLEWARES - SECURITY

// SECURITY HTTP HEADERS
app.use(helmet());

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// DEVELOPMENT LOGGING
// dotEnv.config({ path: './config.env' });
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// BODY PARSER--READING DATA FROM BODY INTO req.body
app.use(express.json()); // middleware

// DATA Sanitization against noSQL query injection
app.use(mongoSanitize());

// DATA Sanitization against XSS
app.use(xss());

// Prevent Parameter pollution
app.use(
  hpp({
    whitelist: 'duration', // whitelist ile neyin duplicate olmasına izin vereceğimizi belirliyoruz
  })
);
// SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));
// bunu html dosylarının URLlerine erişmek için kullanırız

// console.log(process.env.NODE_ENV);

// Database e save etmek için. save() kullandık bu bir promise return eder ve onu de then ile handle ettık ılerıde async awat de kullanabılırız
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('RAN INTON AN ERRORRR BRUHH:', err);
//   });

///////////////////////
//////////////////////

// TEST MIDDLEWARES
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use((req, res, next) => {
  console.log('Hello from the middleware😎');
  next();
});

// test

// middleware içerisindeki fonskyıonlar SIRASIYLA req,res ve nexttir
// next fonksiyonunu call etmezsen kod stuck olarak kalır.

// daha öncesinde yaptığımız routing i expresste get methdo ile yapıyoruz
// ilk parametre url oluyor ikincisi ise biri o url e tıkladıgında ne olacagını yarattıgımz callback
// O CB İÇİNE RES VE REQ ALIR

// app.get("/", (req,res) => {
//     res/*.status(404)*/.send("HELLO FROM THE SERVER SIDE!"); //send yerine json kullanarak {} bir object halinde jsn formatında gonderebılırız
// });

// app.post("/", (req,res) => {
//     res.send("YOU CAN POST TO THIS ENDPOINT");
// });

// // Starting Our API : HANDLING GET REQs
// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));
// // önce datamızın buludnugu dosyayı read ediyoruz

// // TOURS
// // REFACTORING GET
// const getAllTours = (req, res) => {
//   // json koduyla send edecebılecegımızzden bahsetmıstım
//   // json kodu kullanılırken object ile belirtmeyi unutma!
//   res.json({
//     status: 'success',
//     results: tours.length - 1, // olmasına grek yok ama postMan de kaç tane data aldıgımızı gorebılmemız acısından ıyı bır sey
//     data: {
//       tours: tours,
//     },
//   });
// };

// // REFACTORING GET SPESIFIC
// const getSpesificTour = (req, res) => {
//   console.log(req.params); // params dediği şey urlde : ile belirtilenlerdir

//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);
//   // gçrebilecğin üzeriee idler string olarak gelıyor onun için ufak bi trick yaptık

//   // GUARD
//   if (!tour) {
//     return res.status(404).json({
//       status: 'FAIL!',
//       message: `CAN NOT FIND ID: ${req.params.id}`,
//     });
//   }
//   res.json({
//     status: 'success',
//     // results: tours.length - 1,
//     data: {
//       tour: tour,
//     },
//   });
// };

// // REFACTORING POST
// const createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);
//   // yeni datamızı yarattık sımdı bunu dosyanın ıcıne yazmamız gerek
//   fs.writeFile(
//     `./dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       }); // 201 dosyaya bir şey eklendı anlamına gelir
//     }
//   );
//   // console.log(newTour)
// };

// // REFACTORING UPDATE // PATCH
// const updateTour = (req, res) => {
//   // GUARD
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'FAIL',
//       message: `CAN NOT FIND ID:${req.params.id}`,
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<TOUR UPDATED>',
//     },
//   });
// };

// // REFACTORING DELETE
// const deleteTour = (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   }); // 204 => Delete işlemi içindir
// };

// // USERS
// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: 'ERROR',
//     message: 'This route not implemented',
//   });
// };
// const getSpesificUser = (req, res) => {
//   res.status(500).json({
//     status: 'ERROR',
//     message: 'This route not implemented',
//   });
// };
// const createUser = (req, res) => {
//   res.status(500).json({
//     status: 'ERROR',
//     message: 'This route not implemented',
//   });
// };
// const deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'ERROR',
//     message: 'This route not implemented',
//   });
// };
// const updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'ERROR',
//     message: 'This route not implemented',
//   });
// };

// APP REFACTORING hepsını aşağıda ayrı ayrı yaptık ama böyle çok daha düzenli bir şekilde tutabiliriz

// ROUTS
// daha sonrasında tum bu routları handleları vesaire ayrı dosyalara koyacagız ama oncesıonde bır hazırlık yapmamız gerektı.
//
// const tourRouter = express.Router();
// const userRouter = express.Router();
// mounting rout
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// LESSON
app.all('*', (req, res, next) => {
  // res.status(200).json({
  //   status: 'Fail',
  //   message: `Can not found ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Can not found ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);// normalde bir şey pass etmezdik ama bu bir error middleware oldugu ıcın ıcıne yazdııgmız sey ıle error oldgunu belırtıyoruz

  next(new appError(`Can not found ${req.originalUrl} on this server`, 404));
});

// LESSON

app.use(globalErrorHandler);

// TOURS
// tourRouter.route('/').get(getAllTours).post(createTour);

// tourRouter
//   .route('/:id')
//   .get(getSpesificTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// // USERS
// userRouter.route('/').get(getAllUsers).post(createUser);

// userRouter
//   .route('/:id')
//   .get(getSpesificUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// GET GET GET GET GET part

// app.get("/api/v1/tours", getAllTours);

// Yukarıda app.get ile ilk önce url belirledik
// daha sonra o URL e tıklandıgında ne yapılacagını bir callback ile yazdık
// response u bir json formatında gonderdık

// POST POST POST POST POST part
// GET methodunu tum datatyı almak ıcın kullandık POST methodunu ıse yenı bı data yaratmak ıcın kullanacagız

// LESSON
// Id ye göre get methodu ile veri çağırma (spesifik tur ALMA)

// app.get("/api/v1/tours/:id", getSpesificTour);

// app.post("/api/v1/tours", createTour)/*(req, res) => {*/

// normalde bu request in içinde daha önceden yapılmış ve tamamlanmış request e ait cevaplar bulunur
// fakat express bu datanın ıcındekı "body" datasını bu request ın ıcıne koymaz bundan dolayı milddelware diye bir şey kullanacagız
// hemen onu dosyamınızın ustune eklıyoruz (ilk satırlar)
// console.log(req.body);
// res.send("Done");

// her zaman bir şey send etmemiz gerekiyor ki request ve response dongusu tamamlansın
// postman den bodyi değiştirdik ve consolde da req.body de yaptıgımız (ekledıgımız) değişiklikler gozuktu

//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({ id: newId }, req.body);

//     tours.push(newTour);
//     // yeni datamızı yarattık sımdı bunu dosyanın ıcıne yazmamız gerek
//     fs.writeFile(`./dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         res.status(201).json({
//             status: "success",
//             data: {
//                 tour: newTour
//             }
//         }) // 201 dosyaya bir şey eklendı anlamına gelir
//     })
//     // console.log(newTour)

// });

// LESSON

// PUT VE PATCH
// ikisi de veri guncellemesi yapımında kullanılıyor
// biz daha cok pathc kullaanacgız PATCH de  değişmesi gereken propertyleri değiştirememiz yetiyor

// PATCH PATCH PATCH
// app.patch("/api/v1/tours/:id", updateTour);

// DELETE DELETE DELETE
// app.delete("/api/v1/tours/:id", deleteTour);

module.exports = app;

// console.log(process.env);

// const port = /*process.env.PORT || */ 3000;
// app.listen(port, () => {
//   console.log(`APP RUNNING ON PORT ${port}`);
// });
