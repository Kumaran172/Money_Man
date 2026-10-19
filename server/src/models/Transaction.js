import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, required: true, enum: ['credit', 'debit'] },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  note: { type: String, default: '' },
  date: { type: String, required: true }, // Format 'YYYY-MM-DD'
  source: { type: String, default: 'manual' }, // 'manual' | 'sms' | 'sms_bulk'
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.user_id = ret.user_id?.toString();
      ret.profile_id = ret.profile_id?.toString();
      ret.account_id = ret.account_id?.toString();
      return ret;
    }
  }
});

// Index for fast analytics and duplicate checks
transactionSchema.index({ user_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, date: 1, type: 1, amount: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
