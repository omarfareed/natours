const mongoose = require('mongoose'),
  slugify = require('slugify'),
  validator = require('validator'),
  bcrypt = require('bcryptjs'),
  crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is needed']
  },
  email: {
    type: String,
    required: [true, 'Email is needed'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'wrong email format'
    }
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: 'not the same'
    },
    select: false
  },
  passwordChangedAt: {
    type: Date
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordResetToken: String,
  passwordResetExpired: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //this 1 second because the function ((resetPassword)) contains ((signToken))
  next();
});
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async (userPass, hashedPass) =>
  await bcrypt.compare(userPass, hashedPass);

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    return JWTTimeStamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }
};
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, { pass: this.passwordResetToken });
  this.passwordResetExpired = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
// NOTE: ref + populate ==> make as the middleware in pre_save
