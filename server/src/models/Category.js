import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'expense' | 'income'
  icon: { type: String, required: true },
  color: { type: String, required: true }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

export const Category = mongoose.model('Category', categorySchema);
