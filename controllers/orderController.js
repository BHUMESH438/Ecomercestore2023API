const { StatusCodes } = require('http-status-codes');
const customError = require('../errors');
const { checkPermission } = require('../utils');
const Product = require('../model/Product');
const Review = require('../model/Review');
const Order = require('../model/order');

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new customError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermission(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const createOrder = async (req, res) => {
  const { items: cartItems, shippingFee, tax } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new customError.BadRequestError('cart is empty');
  }
  if (!shippingFee || !tax) {
    throw new customError.BadRequestError('tax and shipping is empty');
  }
  let orderItems = [];
  let subtotal = 0;
  for (let item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new customError.NotFoundError(`no product with the id ${item.product}`);
    }

    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id
    };
    //add items to the order
    orderItems = [...orderItems, singleOrderItem];

    //total subtotal
    subtotal += item.amount * price;
  }

  //calculate total
  const total = subtotal + tax + shippingFee;

  //payment integration detail from client side fake data
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd'
  });

  const order = await Order.create({ tax, shippingFee, subtotal, total, orderItems, clientSecret: paymentIntent.client_secret, user: req.user, userId });

  res.status(StatusCodes.CREATED).json({ order, clientSecret: order.client_secret });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new customError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermission(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = { getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder };
