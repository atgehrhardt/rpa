const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'Create Blank Text File',
  description: 'Creates a blank text file to be downloaded.',
  run: async (log = console.log) => {
    return new Promise((resolve, reject) => {
      const downloadDir = path.join(__dirname, 'downloads');
      const fileName = `blank_${Date.now()}.txt`;
      const filePath = path.join(downloadDir, fileName);

      fs.mkdir(downloadDir, { recursive: true }, (mkdirErr) => {
        if (mkdirErr) {
          log(`Task: Error creating directory: ${mkdirErr}`);
          return reject(mkdirErr);
        }

        fs.readdir(downloadDir, (readdirErr, beforeFiles) => {
          if (readdirErr) {
            log(`Task: Error reading directory: ${readdirErr}`);
            return reject(readdirErr);
          }

          log(`Task: Contents of download directory before file creation (${downloadDir}):`);
          log(beforeFiles);

          setTimeout(() => {
            fs.writeFile(filePath, '', 'utf8', (writeErr) => {
              if (writeErr) {
                log(`Task: Error writing file: ${writeErr}`);
                return reject(writeErr);
              }

              log(`Task: Blank file created at ${filePath}`);

              fs.readdir(downloadDir, (readdirErr2, afterFiles) => {
                if (readdirErr2) {
                  log(`Task: Error reading directory after file creation: ${readdirErr2}`);
                  return reject(readdirErr2);
                }

                log(`Task: Contents of download directory after file creation (${downloadDir}):`);
                log(afterFiles);

                resolve(fileName);
              });
            });
          }, 1000);
        });
      });
    });
  }
};