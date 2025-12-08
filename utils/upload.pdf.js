// utils/uploadPdf.js
const cloudinary = require("./cloudinary");

module.exports = function uploadPdf(file, folder, name) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);

        const cleanFolderName = folder.slice(0, -1);
        const fileName = `${cleanFolderName}-${name}-${Date.now()}`;

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: fileName,
                resource_type: "raw",
                format: "pdf"
            },
            (err, result) => {
                if (err) return reject(err);
                resolve(result.secure_url);
            }
        );

        stream.end(file.buffer);
    });
};
