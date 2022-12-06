const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review / rating / createdAt / ref to tour / ref to user
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // PARENT REFERENCING
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a User'],
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
// HER KULLANICININ BIR TUR ICIN 1 YORUMU OLABILIR
// BUNU DA INDEXLERLE BELIRTIYORUZ
// INDEX IN 2.PARAMETREDSI OLARAK OPTIONS GELIYOR BUNU DA UNIQUE YAPYIROUZ
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  }); // tourModelde de aynısını yapmıştık fakat orada istemediğimiz için - koyduk :)
  next();
});

//  LESSON ratingAverage hesaplama
// static methodu kullancagız (daha once ınstance kullandık [modul export edıyoruyzz] )
// ASIL AMACIMIZ TOUR IDSI UZERINEN HER BIR REVIEW GIRILDIGINDE / SILINDIGINDE / UPDATE EDILDIGINDE O ORTALAMAYI GUNCELLEMEK
// BUNU AGGREGATION PIPELINE ILE SAGLAYABILIRIZ
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this points => currentModel => aggregate zaten model uzerıne cagırılır
  // aggreagtion pipeline kullanımı tourController dosyasında mevcut
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour', // neye gore sıralacagımızı belırledık
        nReviews: { $sum: 1 }, // number of Ratings => add 1 for each tour that was matched
        avgRating: { $avg: '$rating' }, // averaj hesaplamak için avg operatorunu kullandık daha sonrada neyın a veragını ıstedıımgız fıled ı yazdık
      },
    },
  ]);
  // ALERT BU FONSKIYONUN SUREKLI KENDINI GUNCELLEMESI YANI OTOMATIK CALL ETMESI GEREK ONU DA MIDDLEWARE ILE YAPACAGIZ ⬇
  console.log(stats);

  // UPDATE TOUR
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nReviews, // STATS aggregate kullanıyor o da bir array oldugundan 0. indexdekı ısteıgımız degerlerı aldıkı
      ratingsAverage: stats[0].avgRating, // STATS aggregate kullanıyor o da bir array oldugundan 0. indexdekı ısteıgımız degerlerı aldıkı
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // UNUTMA POST MIDDLEWARE NEXT() KULLANMAZ
  // this => current review
  // bu MW'de calcAverae ı her save ettıgımızde call edecek ama revıew uzerınden ona ulasmaayız boyle durumlarda thıs.constructor kullanılır
  this.constructor.calcAverageRatings(this.tour); // model uzerınden cagırdıktan sonra tourId yi pass ettik
});

// IMPORTANT ALERT
// findByIdAndUpdate BUNLARI HER REVIEW SILINDIGINDE VE UPDATE EDILDIGINDE KULLANABILMEMIZ GEFEK
// findByIdAndDelete  => bu ikisini query middlewarelarda kullanamayaız
reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverageRatings(doc.tour);
  console.log(doc);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
