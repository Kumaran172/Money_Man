import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '👤' },
  color: { type: String, default: '#10b981' },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.user_id = ret.user_id.toString();
      return ret;
    }
  }
});

export const Profile = mongoose.model('Profile', profileSchema);
