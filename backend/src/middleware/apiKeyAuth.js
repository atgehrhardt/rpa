const ApiKey = require('../models/ApiKey');

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.header('x-api-key');  // Ensure header access and extract x-api-key
  console.log("Received API Key (from header):", apiKey);

  try {
    const apiKeyDoc = await ApiKey.findOne();  // Find the current API Key Doc in DB
    console.log("API Key in database:", apiKeyDoc?.key);

    // Check if API key exists, is enabled, and matches the one provided in the header
    if (!apiKeyDoc || !apiKeyDoc.isEnabled || apiKey !== apiKeyDoc.key) {
      console.error('API Key validation failed');
      return res.status(401).json({ msg: 'Unauthorized: Invalid API Key or API Access Disabled' });
    }

    next();  // If validation passes, proceed to next middleware
  } catch (error) {
    console.error('Error verifying the API Key:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

module.exports = apiKeyAuth;