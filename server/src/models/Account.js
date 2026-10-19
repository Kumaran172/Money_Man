import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  balance: { type: Number, default: 0 },
  color: { type: String, default: '#3b82f6' },
  icon: { type: String, default: 'Wallet' },
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

export const Account = mongoose.model('Account', accountSchema);
