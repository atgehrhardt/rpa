const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: { type: String, required: true },
  isEnabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);