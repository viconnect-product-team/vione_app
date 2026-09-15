const https = require('https');
const fs = require('fs');

function download(id, filename) {
  const url = `https://drive.google.com/uc?export=download&id=${id}`;
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, res2 => {
          const fileStream = fs.createWriteStream(filename);
          res2.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log('Downloaded', filename, 'size:', fs.statSync(filename).size);
            resolve();
          });
        }).on('error', reject);
      } else {
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log('Downloaded', filename, 'size:', fs.statSync(filename).size);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  await download('1X74AX16xcOrtJSmr6ZF5j71_x9pc7PUJ', 'scratch/screen-0.jpg');
  await download('1WS7_P2aa_ADDYQ8d05lW2aQWSTb4DWI9', 'scratch/business.jpg');
}

main();
