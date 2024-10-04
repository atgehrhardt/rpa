const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class UploadManager {
  constructor(uploadDir) {
    this.uploadDir = uploadDir;
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    this.upload = multer({ storage: this.storage });
  }

  async deleteFile(fileName) {
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
    }
  }
}

module.exports = UploadManager;