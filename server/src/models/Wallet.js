import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'payment', 'refund'],
    required: true
  },
  description: String,
  referenceId: String
}, {
  timestamps: true
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  transactions: [transactionSchema]
}, {
  timestamps: true
});

export default mongoose.model('Wallet', walletSchema);
