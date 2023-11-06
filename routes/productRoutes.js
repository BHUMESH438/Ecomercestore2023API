const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage } = require('../controllers/productController');
const { authenticateUser, authPermission } = require('../middleware/authentication');
const { getSingleProductReview } = require('../controllers/reviewController');

router
  .route('/')
  //authenticateUser = unpacking the cookies to get the user data to product routes
  .post([authenticateUser, authPermission('admin')], createProduct)
  .get(getAllProducts);

router.route('/uploadImage').post([authenticateUser, authPermission('admin')], uploadImage);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authPermission('admin')], updateProduct)
  .delete([authenticateUser, authPermission('admin')], deleteProduct);

router.route('/:id/reveiw').get(getSingleProductReview);
module.exports = router;

//while setting up the id / should come first
//asssining the route parameter after / will be id in the route itseld so when we console log it it will give an obj{id:2332} then we can destructure it by using the const{id:product}={id:123}//req.params
