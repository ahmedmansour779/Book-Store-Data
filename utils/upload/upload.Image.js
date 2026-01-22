import path from 'path';
import cloudinary from './cloudinary.js';

export default function uploadImage(file, folder = '', name = '') {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const cleanFolderName = String(folder).replace(/\/+$/g, '');

    let ext = '';
    if (file.originalname) {
      ext = path.extname(file.originalname).replace(/^\./, '');
    }
    if (!ext && file.mimetype) {
      ext = file.mimetype.split('/')[1] || '';
      if (ext === 'jpeg') ext = 'jpg';
    }

    const timestamp = Date.now();
    const safeName = String(name)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const baseId = [cleanFolderName || 'file', safeName || 'upload', timestamp]
      .filter(Boolean)
      .join('-');

    const uploadOptions = {
      folder,
      public_id: baseId,
      resource_type: 'auto',
    };
    if (ext) uploadOptions.format = ext;

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) return reject(err);
      resolve(result && result.secure_url ? result.secure_url : result);
    });

    stream.end(file.buffer);
  });
}
