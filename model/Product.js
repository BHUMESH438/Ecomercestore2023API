const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be more than 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg'
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
      type: String,
      required: [true, 'Please provide company'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported'
      }
    },
    colors: {
      type: [String],
      default: ['#222'],
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    inventory: {
      type: Number,
      required: true,
      default: 15
    },
    averageRating: {
      type: Number,
      default: 0
    },
    numOfReviews: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//connecting the productSchema to the virtual property of the reviews by the local id feild in the product scheema and foreign feild of the product schema

//if we done the vritual property now we can see the reveiw in the product property - get single product as how many memebers made a reveiw
ProductSchema.virtual('reviews', {
  //reviews is the VShma doc
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
  match: { rating: 3 }
  // by this we can filter out the specific property of the ratings which is above 5 in the reveiw for that specific product.
});

//once we removed the product we remove all the review associated with that product
//this pre fun is for monggose v6 or below
// ProductSchema.pre('remove', async function (next) {
//   await this.model('Review').deleteMany({ product: this._id });
// });
//this pre fun is for mongoose v7
// ProductSchema.pre('deleteOne', { document: true, query: false }, async function () {
//   await this.model('Review').deleteMany({ product: this._id });
// });
ProductSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('Product', ProductSchema);
