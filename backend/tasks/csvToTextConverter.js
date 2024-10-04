const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream, createWriteStream } = require('fs');

module.exports = {
  name: 'CSV to TXT Converter',
  description: 'Converts an uploaded CSV file to a TXT file',
  uploadConfig: {
    required: true,
    accept: '.csv',
    maxSize: 5 * 1024 * 1024, // 5MB max size
  },
  run: async (log, uploadedFilePath) => {
    if (!uploadedFilePath) {
      throw new Error('No file path provided');
    }

    log('Starting CSV to TXT conversion');

    const outputFileName = `converted_${Date.now()}.txt`;
    const outputPath = path.join(__dirname, 'downloads', outputFileName);

    return new Promise((resolve, reject) => {
      const results = [];
      createReadStream(uploadedFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            let outputContent = '';
            results.forEach((row, index) => {
              outputContent += `Row ${index + 1}:\n`;
              for (const [key, value] of Object.entries(row)) {
                outputContent += `  ${key}: ${value}\n`;
              }
              outputContent += '\n';
            });

            await fs.writeFile(outputPath, outputContent);
            log(`Conversion complete. Output file: ${outputFileName}`);
            resolve(outputFileName);
          } catch (error) {
            log(`Error writing output file: ${error.message}`);
            reject(error);
          }
        })
        .on('error', (error) => {
          log(`Error parsing CSV: ${error.message}`);
          reject(error);
        });
    });
  }
};