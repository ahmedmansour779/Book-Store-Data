// utils/uploadImage.js
const cloudinary = require("cloudinary").v2;

module.exports = function uploadImage(file, folder, name) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const cleanFolderName = folder.slice(0, -1)
    const fileName = `${cleanFolderName}-${name}-${Date.now()}`;
    // لو المستخدم: user-123123123
    // لو الكورسات: courses-123123123

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: "image"
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};
