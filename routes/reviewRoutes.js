const express = require('express');
const router = express.Router();
const { createReview, getAllReviews, getSingleReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/authentication');
module.exports = router;

router.route('/').post(authenticateUser, createReview).get(getAllReviews);

router.route('/:id').delete(authenticateUser, deleteReview).patch(authenticateUser, updateReview).get(getSingleReview);
