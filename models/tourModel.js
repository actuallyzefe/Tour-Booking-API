// const { string } = require('i/lib/util');

const slugify = require('slugify');

const mongoose = require('mongoose');
// database imizi mongoose a express ile bağladıktan sonra Model oluştuduk
// Tıpkı OOP js gibi class oluşturur gibi yaptık bir şema oluşturduk
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
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
    priceDiscount: Number,

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

// LESSON
// mongooseda da middlewarelar vardır (middleware => iki event arası olayları kontrol etmek)
// Document Middleware runs before .save() nad .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', (next) => {
  console.log('AYNI HOOKTA 1DEN FAZLA PRE VE POST MWSİ OLA BİLİR');
  next();
});

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

// QUERY MWs POST
// Post mw => queryden return lan butun documentlere erısebılıyoruz
// POST mw => runs AFTER the query has already executed
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms `);
  console.log(docs);
  next();
});

// Burada oluştududğumuz şemalara uygun documentler oluşturduk
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
