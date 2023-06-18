const axios = require('axios');
const fs = require('fs');
var path = require('path');

function saveImageUrl (imageUrl, imageName){
    const imagePath = path.join('./public/assets/images/admin', imageName);
  
    axios({
      url: imageUrl,
      responseType: 'stream'
    })
      .then(response => {
        response.data.pipe(fs.createWriteStream(imagePath));
        return new Promise((resolve, reject) => {
          response.data.on('end', resolve);
          response.data.on('error', reject);
        });
      })
      .then(() => {
        console.log('Image downloaded and saved successfully.');
      })
      .catch(error => {
        console.error('Error downloading and saving the image:', error);
      });
  }


  saveImageUrl ('https://lh3.googleusercontent.com/a/AAcHTtd3Lozgq4HPvlnmutQdfuV_piv_j7E6r21dCfeP=s96-c' , 'kake');