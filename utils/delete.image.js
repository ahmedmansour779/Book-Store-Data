const cloudinary = require('./cloudinary');

module.exports = async function deleteImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null);

    try {
      const parts = url.split('/upload/')[1];
      if (!parts) return resolve(null);

      const segments = parts.split('/');
      const folder = segments.slice(1, -1).join('/');
      const fileWithExt = segments[segments.length - 1];
      const file = decodeURIComponent(fileWithExt.split('.')[0]);

      const publicId = folder ? `${folder}/${file}` : file;

      console.log('Deleting Cloudinary public_id:', publicId);

      cloudinary.uploader.destroy(publicId, (err, result) => {
        if (err) {
          console.error('Cloudinary delete error:', err);
          return reject(err);
        }
        console.log('Cloudinary delete result:', result);
        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
};
