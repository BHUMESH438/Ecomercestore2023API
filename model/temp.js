import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    $match: {
      product: new ObjectId('647dbe5c3d84d3b6cfaf4245')
    }
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: '$rating'
      },
      numOfReviews: {
        $sum: 1
      }
    }
  }
];

const client = await MongoClient.connect('', { useNewUrlParser: true, useUnifiedTopology: true });
const coll = client.db('10-ecommerce-api').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();

//1.go to the collection of the mongo db and select aggregation
//2.match all reviews to the product collection by the product id which we given in the db
//3.group by and do calculation according to the need
