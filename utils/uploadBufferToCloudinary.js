const cloudinary = require("cloudinary").v2;

function uploadBufferToCloudinary(buffer, fileName, folder = "letters") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder,
        public_id: `${fileName}.pdf`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}


module.exports = { uploadBufferToCloudinary };


