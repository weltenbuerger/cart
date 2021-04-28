// orderCreatedAt
// orderStatus
// paymentStatus
// customerId
// items
// totalQty
// subtotalPrice
// shippingPrice
// discount
// totalPrice
// tradeCredit
// finalPrice

const { Schema, model } = require('mongoose')

const orderSchema = new Schema(
  {
    orderStatus: {
      type: String,
      enum: [
        'ordered',
        'cancelled',
        'shipped',
        'returned',
        'partially returned',
        'closed',
      ],
      required: [true, 'orderStatus is required.'],
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'refunded', 'declined payment', 'pending'],
      required: [true, 'orderStatus is required.'],
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [Schema.Types.Mixed],
    totalQty: {
      type: Number,
      min: 0,
    },
    subtotalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    tradeCredit: {
      type: Number,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    shippingOption: {
      type: String,
      enum: ['standard', 'free', 'express'],
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentOption: {
      type: String,
      enum: ['paypal', 'visa', 'mastercard', 'sofort'],
      required: true,
    },
  },
  { timestamps: { createdAt: 'orderCreatedAt' } }
)

const Order = model('Order', orderSchema)

module.exports = Order
