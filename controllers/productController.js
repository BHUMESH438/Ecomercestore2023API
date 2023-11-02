const Product = require('../model/Product');
const { StatusCodes } = require('http-status-codes');
const CustomerError = require('../errors');

//2.path
const path = require('path'); //path is an inbuilt module to set the path so that the image will be transfered

const createProduct = async (req, res) => {
  //our middleware unpack the cookie and jwt and give the user loggedin in that product
  req.body.user = req.user.userId;
  console.log('>>>>>>>>>>>>>>', req.body);
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate('reviews'); //vritual collection and as it is a virtual schema not real we cannot get the query
  if (!product) throw new CustomerError.BadRequestError(`no product with this id: ${productId}`);
  res.status(StatusCodes.OK).json({ product });
};
//if we used findone count dosnt work and it only work for a bunch of return "find"
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, { new: true, validators: true });
  if (!product) throw new CustomerError.BadRequestError(`no product with this id: ${productId}`);
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  //mwthod-1: it will work - BUT only delete the product
  const { id: productId } = req.params;
  const product = await Product.deleteOne({ _id: productId });
  if (!product) {
    throw new CustomerError.BadRequestError(`no product with this id: ${productId}`);
  }
  //method-2: it wont but we used this to delete product wwith the reviews
  // const { id: productId } = req.params;
  // const product = await Product.findOne({ _id: productId });
  // if (!product) {
  //   throw new CustomerError.NotFoundError(`No product with id : ${productId}`);
  // }
  // await product.remove();//still not works
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

const uploadImage = async (req, res) => {
  //1.check the req for the uploaded file in the server
  console.log('>>>>>>>upload image', req.files);
  //2.if not write a condition
  if (!req.files) {
    throw new CustomerError.BadRequestError('no file uploaded');
  }
  //3.if file uploaded check wether the image uploaded is mime type
  if (!req.files.image.mimetype.startsWith('image')) {
    throw new CustomerError.BadRequestError('plesase upload a image');
  }
  //set the size
  const maxsize = 1024 * 1024;
  if (req.files.image.size > maxsize) {
    throw new CustomerError.BadRequestError('size should be less than 1mb');
  }
  //4.after comformation save it in a variable
  const productImage = req.files.image;

  //5.after postman setup set the image path to the public folder in the server where it should get set

  const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);

  await productImage.mv(imagePath);

  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage };

//if we use find one and update there is no need to invoke the shema model
//re.files not file
