const cloudinary = require("cloudinary").v2;

exports.uploadDocumentToCloudinary = async (file, folder) => {
  const options = { folder };

  // Set the resource type to "raw" for document uploads
  options.resource_type = "raw";

  // Extract the file extension from the original file
  const fileExtension = file.name.split('.').pop();

  // Construct the file name with the extension
  const fileName = `${file.name.split('.')[0]}.${fileExtension}`;

  return await cloudinary.uploader.upload(file.tempFilePath, {
    ...options,
    public_id: fileName,
  });
};