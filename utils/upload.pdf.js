const cloudinary = require('./cloudinary');

module.exports = function uploadPdf(file, folder) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const cleanFolderName = folder.endsWith('/') ? folder.slice(0, -1) : folder;

    const fileName = `${cleanFolderName}-${Date.now()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: 'raw',
        use_filename: true,
        unique_filename: false,
        format: 'pdf',
        access_mode: 'public', // ⭐ يخليه Public
      },
      (err, result) => {
        if (err) return reject(err);

        // ⭐ لينك تحميل مباشر
        const downloadUrl = result.secure_url.replace('/upload/', '/upload/fl_attachment/');

        resolve(downloadUrl);
      }
    );

    stream.end(file.buffer);
  });
};
