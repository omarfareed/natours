const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: 10,
      maxlength: 40
      // validate: [validator.isAlpha, 'Tour name must contain chars only']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      enum: ['difficult', 'easy', 'medium']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have max Group size']
    },
    priceDiscount: {
      type: Number,
      validate: {
        //your validator
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount Price {VALUE} is greater than it'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: {
      type: [String]
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: {
      type: [Date]
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    slug: String
  },
  {
    toJSON: { virtuals: true }
    // toObject: { virtuals: true }
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 }); // NOTE:
tourSchema.index({ slug: -1 });
tourSchema.index({ startLocation: '2dsphere' });
// indexing is important
// 1 or -1 ==> asc or des
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  // UNDERSTAND: I don't understand it
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
// DOCUMENT MIDDLEWARE save and create
tourSchema.pre('save', function(next) {
  // console.log(this);
  this.slug = slugify(this.name, { upper: true });
  // console.log(1);
  next();
});
tourSchema.post('save', function(doc, next) {
  // console.log('2');
  // console.log(`this ==> `);
  // console.log(this);
  // console.log('doc ==> ');
  // console.log(doc);
  next();
});
// NOTE: solution using id without reference
// tourSchema.pre('save' , async function(next){
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next()
// })
tourSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next(/* error here if exist*/);
});
tourSchema.pre(/^find/, async function(next) {
  this.populate({
    path: 'guides'
    // select: ''
  });
  // console.log(this);
  next();
});
tourSchema.post(/^find/, function(doc, next) {
  // console.log(this);
  // console.log(doc);
  // console.log(`${Date.now() - this.start}`);

  next();
});

// tourSchema.pre('aggregate', function(next) {
//   // console.log(this.pipeline()[0].$group);
//   this.pipeline().unshift({ $unwind: '$startDates' });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//   name : 'first',
//   rating : 4.7,
//   price : 497
// })
// testTour.save().then(doc => {
//   console.log(doc);
// }).catch(err => console.error(err))
module.exports = Tour;
