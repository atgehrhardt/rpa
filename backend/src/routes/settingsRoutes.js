const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey');

// Fetch current API key data
router.get('/', async (req, res) => {
  try {
    const apiKeyDoc = await ApiKey.findOne();
    if (!apiKeyDoc) {
      return res.status(404).json({ msg: 'API Key not found' });
    }
    res.json({ apiKey: apiKeyDoc.key, apiKeyEnabled: apiKeyDoc.isEnabled });
  } catch (error) {
    console.error('Error retrieving API Key:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// Toggle API access
router.post('/toggle-api', async (req, res) => {
  try {
    const apiKeyDoc = await ApiKey.findOne();
    if (!apiKeyDoc) {
      return res.status(404).json({ msg: 'API Key not found' });
    }
    apiKeyDoc.isEnabled = !apiKeyDoc.isEnabled;
    await apiKeyDoc.save();
    res.json({ apiKeyEnabled: apiKeyDoc.isEnabled });
  } catch (error) {
    console.error('Error toggling API access:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// Regenerate API Key
router.post('/regenerate-api-key', async (req, res) => {
  try {
    const newApiKey = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1d' });
  
    const apiKeyDoc = await ApiKey.findOneAndUpdate(
      {},
      { key: newApiKey },
      { new: true, upsert: true }
    );

    console.log("API Key has been regenerated:", newApiKey);  // Log the new key

    res.json({ apiKey: apiKeyDoc.key });
  } catch (error) {
    console.error('Error regenerating API Key:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

module.exports = router;