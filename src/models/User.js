import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
    type: String,
    required: true, 
    trim: true
  },
  password: {
    type: String,
    required: true, 
    minlength: 6
  },
  otp: {
  type: String
},
  otpExpires: {
  type: Date
},
  phoneNumber: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true 
})

const User = mongoose.model('User', userSchema);

export default User