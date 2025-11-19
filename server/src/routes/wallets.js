import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Wallet from '../models/Wallet.js';

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
      await wallet.save();
    }
    
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/transaction', authenticate, async (req, res) => {
  try {
    const { amount, type, description, referenceId } = req.body;
    
    let wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
    }

    if (type === 'debit' || type === 'payment') {
      if (wallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      wallet.balance -= amount;
    } else {
      wallet.balance += amount;
    }

    wallet.transactions.push({
      amount,
      type,
      description,
      referenceId
    });

    await wallet.save();
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
