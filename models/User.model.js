const { Schema, model } = require('mongoose')

//     country
// firstName
// lastName
// company
// street
// apt
// postalcode
// phone
// email

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    company: {
      type: String,
    },
    street: {
      type: String,
    },
    apt: {
      type: String,
    },
    postalcode: {
      type: String,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    country: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const User = model('User', userSchema)

module.exports = User
