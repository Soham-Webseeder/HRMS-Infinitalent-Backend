const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the base uploads directory exists
const baseDir = "uploads";
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 1. Map field names from your UI to specific subfolders
    const folderMap = {
      photograph: "photographs",
      resume: "resumes",
      aadharCard: "compliance",
      panCard: "compliance",
      SSC: "education",
      HSC: "education",
    };

    // 2. Identify the subfolder (default to 'documents' for dynamic additions)
    let subFolder = folderMap[file.fieldname] || "documents";
    
    // 3. Construct and verify path
    const dir = path.join(baseDir, subFolder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // 4. Sanitize and timestamp filenames to avoid collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // List of allowed MIME types
    const allowedMimeTypes = [
      "image/jpeg", 
      "image/png", 
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    // Check the MIME type instead of the extension
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images (JPG, PNG) and documents (PDF, DOCX, XLSX) are allowed."));
    }
  }
});

module.exports = upload;