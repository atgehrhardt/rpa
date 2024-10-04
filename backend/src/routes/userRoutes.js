const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ msg: 'User already registered or pending approval' });  

    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Make the first user an admin
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      user.isAdmin = true;
      user.isApproved = true;
    }

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.isApproved) return res.status(403).json({ msg: 'Account not approved' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user info
router.get('/me', auth, async (req, res) => {
  console.log("Accessing /me route, user id:", req.user.id);
  try {
    const user = await User.findById(req.user.id).select('-password');  // Exclude password
    console.log("User details retrieved:", user);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin: Get all unapproved users
router.get('/unapproved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) return res.status(403).json({ msg: 'Not authorized' });

    const unapprovedUsers = await User.find({ isApproved: false }).select('-password');
    res.json(unapprovedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin: Approve user
router.put('/approve/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.isAdmin) return res.status(403).json({ msg: 'Not authorized' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isApproved = true;
    await user.save();

    res.json({ msg: 'User approved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin: Deny (Delete) user
router.delete('/deny/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.isAdmin) return res.status(403).json({ msg: 'Not authorized' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.isApproved) return res.status(400).json({ msg: 'Cannot delete approved user' });

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: 'User denied and deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;