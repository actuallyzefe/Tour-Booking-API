// const { string } = require('i/lib/util');
const User = require('./userModel');
const slugify = require('slugify');
const validator = require('validator');
const mongoose = require('mongoose');
const { promises } = require('nodemailer/lib/xoauth2');
// database imizi mongoose a express ile bağladıktan sonra Model oluştuduk
// Tıpkı OOP js gibi class oluşturur gibi yaptık bir şema oluşturduk
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour Name max 40'],
      minlength: [10, 'Tour Name min 40'],
      // validate: [validator.isAlpha, 'Tour must only contain characters '],
    },
    slug: String,

    duration: {
      type: Number,
      require: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'EASY MEDIUM OR DIFFICULT',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Price must be greater than discount',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have SUMMARY'],
    },

    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description'],
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // böylelikle kullancıya tour un ne zaman yaratıldıgını gızledık
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // DATA MODELING
    startLocation: {
      // geoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    // EMBEDDING
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    // CHILD REFERENCING
    guides: [
      {
        type: mongoose.Schema.ObjectId, //Basic String veya Number olamsını istemiyoruzz mongoDB idsi olsun istiyoruz
        ref: User, // yukarıda userModel i import etmesek de calısır * ref: User*
      }, // daha önce .pre ile yazdıgımız koddan tek farkı idsi girilen userları gostermemek onu da populating ile çözeceğiz
      // ayrıca aşağıda yaptıgımız kod embedding üzerine dayılydı bu child referencing
      // populate i query middleware olarak yazdık
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toOBJECT: {
      virtuals: true,
    },
  }
);

// LESSON
// Virtual Properties => are basicly fields that we can define on our schema but tyhey will not be persisted
// so they will not be saved into the database in order to save us some space there
// gereksiz bilgileri değişirsen bile database de tutmak yararlı olmayacagğından bunları kullanıyoruz
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// IMPORTANT IMPORTANT IMPORTANT
// durationWeeks i HİÇBİR ŞEKİLDE BİR QUERY OLARAK KULLANAMYIZ CUNKU BU DATABASEIMIZDE YER ALAN BİR ŞEY DEGIL

// IMPORTANT LESSON IMPORTANT
// Virtual P
tourSchema.virtual('reviews', {
  // VIRTUAL POPULATE => DETAYLI BILGI DEFTERDE
  ref: 'Review', // name of the model
  foreignField: 'tour', // // hangi dataset ile yapacagımızı yazdık
  localField: '_id', // tour idsinin nerede bulundugnu yazdık
});

// LESSON
// mongooseda da middlewarelar vardır (middleware => iki event arası olayları kontrol etmek)
// Document Middleware runs before .save() AND .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', (next) => {
  console.log('AYNI HOOKTA 1DEN FAZLA PRE VE POST MWSİ OLABİLİR');
  next();
});

// IMPORTANT LESSON EMBEDDING
// Yeni tur yaratırken o turun rehberinin kim olacagını idlerle belirttik ve idleri embed ettik => böylelikle rehberler hakkındaki tüm bilgiler dataya dahil oldu
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // girilen datalar bir array olacagından map kullandık
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// post middlewareları ise butun pre mwler çalıştıktan sonra çalışacaktır.
// ve post mwler onceden biten finishd documantları parametre olarak alabilirler
tourSchema.post('save', function (doc, next) {
  console.log(doc); // kaydedilen dokumanın detaylarını konsolda goruyoruz (this.slug ile başlyaanda yarattık postmanden de uyguladık)
  next();
});
///////////////////
//////////////////
// LESSON
// mongoose MWs 2) Query MiddleWARE
// Query mw => allows us to runfunctions before or after a certain query executed.

// tourSchema.pre('find', function (next) {
//   // thats gonna run BEFORE any "FIND" query is executed!
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// IMPORTANT BUG FIX-ME
// YUKARIDA YAPTIGIMIZ KESINLIKLE DOGRU FAKAT GOZUKMEMESINI ISTEDIGIMIZ BIR SEYI URL E IDSINI GIRDIGIMIZDE YINE DE GOZUKUYOR BUNUN OLMAMAIS ICIN FILTERELEMEYI GLOBAL YAPICAZ
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now(); // ne kadar surudugnu gorebılmek ıcın milisanıye cınsınden yarattık oylesıne
  next();
});
// IMPORTANT
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// QUERY MWs POST
// Post mw => queryden returnlanan butun documentlere erısebılıyoruz
// POST mw => runs AFTER the query has already executed
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms `);
  // console.log(docs);
  next();
});
///////////////////
//////////////////
// LESSON
// AGGREGATION MWs
// Aggregation MWs => allows us to add hooks before or after an aggregegation executed.
tourSchema.pre('aggregate', function (next) {
  // unshift kullanarak pipeline ın başına yenı stage ekliyoruz o da secretTour olacak
  // böylelikle Toplan Tur sayısını vesaire (Tour stats-postman) gösterirken secretTourlar dahil olmayacak
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// Burada oluştududğumuz şemalara uygun documentler oluşturduk
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
