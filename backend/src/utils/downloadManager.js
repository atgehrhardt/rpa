const path = require('path');
const fs = require('fs');

class DownloadManager {
  constructor(downloadDir) {
    this.downloadDir = downloadDir;
  }

  getFilePath(fileName) {
    return path.join(this.downloadDir, fileName);
  }

  async streamFile(res, fileName) {
    const filePath = this.getFilePath(fileName);
    
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (error) {
      throw new Error('File not found');
    }

    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;

    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': fileSize
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    return new Promise((resolve, reject) => {
      fileStream.on('end', () => {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting file: ${err}`);
        });
        resolve();
      });
      fileStream.on('error', reject);
    });
  }
}

module.exports = DownloadManager;