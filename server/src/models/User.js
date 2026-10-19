import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.password_hash;
      return ret;
    }
  }
});

export const User = mongoose.model('User', userSchema);
