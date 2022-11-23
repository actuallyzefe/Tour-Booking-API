// REFACTORING GET data get etmeyi mongo ile asyn fonskıyon seklıdne yapabiliriz data get => data/file read/okuma yapma

// REFACTORING IMPORTANT // olusturdugumuz tum methodları bir class a aldık ve farklı bir soyaya tasıyıp burada require ettik
// exports.getAllTours = async (req, res) => {
// try {
console.log(req.query);

// BUILD QUERY
// 1A) FILTERING LESSON
const queryObj = { ...req.query };
const excludedFields = ['page', 'sort', 'limit', 'fields'];
excludedFields.forEach((el) => delete queryObj[el]);

// IMPORTANT LESSON
// STEP 1: We created a copy of the req.query using spread operator const queryObj = {...req.query}

// STEP 2: We created an array of object that we want to exclude from the query strings const excludedFields = ['page', 'sort', 'limit', 'fileds']

// STEP 3: We have to loop through the array to exclude what we don't want to consider.

// excludedFields.forEach(el => delete queryObj[el])
// console.log(req.query, queryObj);

// 2B) ADVANCED FILTERING LESSON
let queryStr = JSON.stringify(queryObj); // replace kullanabılmek adına objectki stringe donsuturduk
queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`); // stringleri de normalde mongoDB operotur olan $gte $gt $lt vesaire bunları regular expressionlarla degıstırecegız
// console.log(JSON.parse(queryStr));

let query = Tour.find(JSON.parse(queryStr)); // Tour.find() bize bir query return edecek ve o query i birçok kez chain edebileceğiz

// 2) SORTING LESSON
if (req.query.sort) {
  const sortBy = req.query.sort.split(',').join(' '); // eğer ki sıralamamızı ıstedıgımız secenkde eşitlik olursa farklı bir kriter belirledik
  // console.log(sortBy);
  query = query.sort(sortBy); // query = query.sort(req.query.sort); // query.sort un içine ise neye gore sıralanmasını sıtedıgmzı belırttık o da  requestin i.indeki querynin içindeki postmande belırttıgımız sorting adı yani price (mesela)
} else {
  query = query.sortquery = query.sort('-createdAt name'); // kullanıcı hiçbir sorting belirtmezse default olarak ilk önce en yeni eklenen Tour u görüntüleyecek (normalde -createdAt yazmıstık ama bir buga sebep oldugundan ada gore sıralanmasını istedik)
}

// 3) LIMITING FIELDS // LESSON // field dediğimiz eşler kullanıcga response olarak datanın gozukecek kısımlarını secmek gibidir
if (req.query.fields) {
  const fields = req.query.fields.split(',').join(' '); // burayı tıpkı sortingde yaptıgımız gibi önce postmande belirttik daha somrada query ye atadık
  query = query.select(fields);
} else {
  query = query.select('-__v'); // bu __v mongoose un kullandıgı ama kullancıyı ılgılendırmeyen bir şey ondan dolayı onun harıcındeki tum datayı default olarak gosterdık
}

// 4) PAGINATION LESSON => 1-10 a kadar olan makaleler sayfa1 / 11-20 sayfa 2,/ 21-30 sayfa 3
const page = req.query.page * 1 /*stringden number a çevirdik*/ || 1;
const limit = req.query.limit * 1 || 100;
const skip = (page - 1) * limit;

if (req.query.page) {
  const numTours = await Tour.countDocuments(); // eğer ki var olan document sayısından fazla bir şey istendiyse error verecegız
  if (skip >= numTours) throw new Error("This page doesn't exist");
}

// burada da kullanıcının hangı sayfayı ıstedıgınde yapıalcak formulu uyguladık
query = query.skip(skip).limit(limit); // skip methodu kac sayfa atlanacagını limit ise oncesınde gordugumuzun aynısı kac result gosterecegını limitliyor

// EXECUDE QUERY
const tours = await query;

// fix
