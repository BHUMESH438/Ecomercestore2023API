const { StatusCodes } = require('http-status-codes');
const customError = require('../errors');
const { checkPermission } = require('../utils');
const Product = require('../model/Product');
const Review = require('../model/Review');

const createReview = async (req, res) => {
  console.log('req.body>>>>>>>>>>>>', req.body);
  console.log('req.user.userId>>>>>>>>>>>>', req.user.userId);
  console.log(' req.body.user>>>>>>>>>>>>', req.body.user);
  const { product: productId } = req.body; //1.getting product id from the product
  console.log(' productId>>>>>>>>>>>>', productId);
  //if valid then or if not valid product then stop
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new customError.BadRequestError(`No product with id:${productId}`);
  }
  //if already submitted then stop or continue -- check the product id from the product where the user send the id of the product and the user id from the token of the current user which is a req from the checkpermission middleware
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId
  });

  if (alreadySubmitted) {
    throw new customError.BadRequestError(`alreadySubmitted review for this product by the user`);
  }
  req.body.user = req.user.userId; //attach user property
  console.log('req.body.user>>>>>>>>>>>>', req.body.user);
  const review = await Review.create(req.body);
  //when ever we send the body in the review we dont need to { } as it is already in obj
  res.status(StatusCodes.CREATED).json({ review });
};

//populate method helps us to view the property of the other collection document. we need to set the path of the product we attached and the property of the product document.

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({ path: 'product', select: 'name price company' }).populate({ path: 'user', select: 'name' });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.find({ _id: reviewId });
  if (!review) {
    throw new customError.BadRequestError(`No review with id:${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new customError.BadRequestError(`No review with id:${reviewId}`);
  }
  checkPermission(req.user, review.user);
  //setting review property =  rating, title, comment
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save(); //for save its working in and in shema we will add post.save
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  // console.log('review for delete>>>>>>>>>>>>>>>>>>', review.user);
  // console.log('review for delete>>>>>>>>>>>>>>>>>>', review.user.ObjectId);
  // console.log('review for delete>>>>>>>>>>>>>>>>>>', review.rating);
  if (!review) {
    throw new customError.NotFoundError(`No review with id:${reviewId}`);
  }
  checkPermission(req.user, review.user);
  // await review.remove();
  await Review.findOneAndDelete({ _id: reviewId });
  res.status(StatusCodes.OK).json({ msg: 'Success review removed' });
};

//functionallity for single product reveiwv
//this is not avilable on vrituals it is actual db and in virtuals we cant query
const getSingleProductReview = async (req, res) => {
  console.log(req.params);
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
//export this getSingleProductReview to productroute
//if we used the findOne instead of find we cant able to do count object. Because the count is an array method that count the lenght of the array so the findOne give {} obj alo we find that by giving parameter destructured inside it and the find gives us a array of object.

module.exports = { createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleProductReview };

//if we used the await i.e try/catch inside the if {} some times it wont work and that is due to the try/catch or the promise i think so
