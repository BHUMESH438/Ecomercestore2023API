const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating']
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    }
  },
  { timestamps: true }
);

//compound indexing of schema user can leave only one product review per index
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

//Aggregation
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);

  console.log('>>>>>>>>>>>>>>>>>result', result);
  //2.after 1 adding and updating the newly added aggregation in the product model and use try and catch
  try {
    await this.model('Product').findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
  console.log('>>>>>>>>>>>>>>>PSH');
});

//if we called the review remove we should call await review.remove() in the delete function of the review controller
// ReviewSchema.post('remove', async function () {
//   // await this.constructor.calculateAverageRating(this.product);
//   console.log('>>>>>>>>>>>>>>>PRH');
// });
module.exports = mongoose.model('Review', ReviewSchema);
