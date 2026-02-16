const Candidate = require("../../models/recruitment/candidate");
const { uploadImageToCloudinary } = require("../../utils/imageUploader");
const { uploadDocumentToCloudinary } = require("../../utils/uploadDocument");



// Function to generate a unique candidateId
const generateUniqueCandidateId = async () => {
  const lastCandidate = await Candidate.findOne().sort({ candidateId: -1 });
  return lastCandidate && lastCandidate.candidateId ? lastCandidate.candidateId + 1 : 1; // Start with 1 if no candidate exists
};

// Create Candidate
// exports.createCandidate = async (req, res) => {
//   try {
//     const data = req.body;
//     const files = req.files || {};

//     const uploadPromises = [];
//     if (files.document) {
//       uploadPromises.push(
//         uploadImageToCloudinary(
//           files.document,
//           process.env.FOLDER_NAME,
//           1000,
//           1000
//         )
//       );
//     }
//     if (files.resume) {
//       uploadPromises.push(
//         uploadImageToCloudinary(
//           files.resume,
//           process.env.FOLDER_NAME,
//           1000,
//           1000
//         )
//       );
//     }

//     const uploadedFiles = await Promise.all(uploadPromises);
//     if (uploadedFiles.length > 0) {
//       if (files.document) data.document = uploadedFiles.shift().secure_url; // Corrected field from 'photograph' to 'document'
//       if (files.resume) data.resume = uploadedFiles.shift().secure_url;
//     }

//     data.candidateId = await generateUniqueCandidateId();
//     if (isNaN(data.candidateId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid candidateId generated.",
//       });
//     }

//     const candidate = await Candidate.create({ ...data });

//     return res.status(200).json({
//       success: true,
//       data: candidate,
//       message: "Candidate Created Successfully....",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.createCandidate = async (req, res) => {
  try {
    const data = req.body; // Get form data
    const files = req.files || {}; // Get uploaded files

    // Check if educationalInfo or pastExperience were sent as strings, and parse them
    if (data.educationalInfo) {
      data.educationalInfo = JSON.parse(data.educationalInfo);
    }

    if (data.pastExperience) {
      data.pastExperience = JSON.parse(data.pastExperience);
    }

    const uploadPromises = [];
    
    // Upload document if it exists
    if (files.document) {
      uploadPromises.push(
        uploadImageToCloudinary(files.document, process.env.FOLDER_NAME, 1000, 1000)
      );
    }

    // Upload resume if it exists
    if (files.resume) {
      uploadPromises.push(
        uploadImageToCloudinary(files.resume, process.env.FOLDER_NAME, 1000, 1000)
      );
    }

    // Await Cloudinary uploads and save URLs
    const uploadedFiles = await Promise.all(uploadPromises);
    
    // If there are uploaded files, attach their URLs to the candidate data
    if (uploadedFiles.length > 0) {
      if (files.document) data.document = uploadedFiles.shift().secure_url;
      if (files.resume) data.resume = uploadedFiles.shift().secure_url;
    }

    // Generate candidate ID
    data.candidateId = await generateUniqueCandidateId();
    
    if (isNaN(data.candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidateId generated.",
      });
    }

    // Create the candidate document in MongoDB
    const candidate = await Candidate.create({ ...data });

    return res.status(200).json({
      success: true,
      data: candidate,
      message: "Candidate Created Successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get All Candidate
exports.getAllCandidate = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit =parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.candidateName = { $regex: name, $options: "i" }; // Case-insensitive search on candidateName
    }

    const candidate = await Candidate.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("jobPosition", "name");

      console.log(candidate,"cand")
    const totalCandidate = await Candidate.countDocuments(filter);
    const totalPages = Math.ceil(totalCandidate / limit);

    if (!candidate || candidate.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Candidate Found..",
      });
    }

    return res.status(200).json({
      success: true,
      data: candidate,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCandidate: totalCandidate,
      },
      message: "Candidates Fetched Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Candidate By Id
exports.getCandidateById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Candidate Id is required for fetching candidate",
      });
    }
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "candidate Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: candidate,
      message: "candidate Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Candidate
// exports.updateCandidate = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const data = req.body;
//     if (!id) {
//       return res.status(404).json({
//         success: false,
//         message: "candidate Id is required for updatating candidate",
//       });
//     }
//     const updatedData = await Candidate.findByIdAndUpdate(id, data, {
//       new: true,
//     });
//     if (!updatedData) {
//       return res.status(404).json({
//         success: false,
//         message: "candidate Not Found",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       data: updatedData,
//       message: "candidate Updated Successfully...",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.updateCandidate = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const data = req.body;
//     if (!id) {
//       return res.status(404).json({
//         success: false,
//         message: "Candidate Id is required for updating candidate",
//       });
//     }

//     // Check if an image file is included in the request
//     const files = req.files || {}

//     const uploadPromises = []
//     if(files.document){
//       uploadPromises.push(uploadImageToCloudinary(files.document,process.env.FOLDER_NAME,1000,1000))
//     }
//     if(files.resume){
//       uploadPromises.push(uploadImageToCloudinary(files.resume,process.env.FOLDER_NAME,1000,1000))
//     }

//     const uploadedFiles = await Promise.all(uploadPromises)
//     if(uploadedFiles.length>0){
//       if(files.document) data.document = uploadedFiles.shift().secure_url;
//       if(files.resume) data.resume = uploadedFiles.shift().secure_url
//     }

//     const updatedData = await Candidate.findByIdAndUpdate(id, data, {
//       new: true,
//     });
//     if (!updatedData) {
//       return res.status(404).json({
//         success: false,
//         message: "Candidate Not Found",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       data: updatedData,
//       message: "Candidate Updated Successfully...",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



exports.updateCandidate = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Candidate Id is required for updating candidate",
      });
    }

    // Check if files (document or resume) are included in the request
    const files = req.files || {};

    const uploadPromises = [];

    // Use uploadDocumentToCloudinary for document and resume (both as documents)
    if (files.document) {
      uploadPromises.push(
        uploadDocumentToCloudinary(
          files.document,
          process.env.FOLDER_NAME // Use the folder name from environment variables
        )
      );
    }

    if (files.resume) {
      uploadPromises.push(
        uploadDocumentToCloudinary(
          files.resume,
          process.env.FOLDER_NAME // Use the folder name from environment variables
        )
      );
    }

    // Wait for all uploads to Cloudinary to complete
    const uploadedFiles = await Promise.all(uploadPromises);

    // Attach the uploaded file URLs to the data object
    if (uploadedFiles.length > 0) {
      if (files.document) data.document = uploadedFiles.shift().secure_url;
      if (files.resume) data.resume = uploadedFiles.shift().secure_url;
    }

    // Update the candidate information in the database
    const updatedData = await Candidate.findByIdAndUpdate(id, data, {
      new: true, // Return the updated document
    });

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Candidate Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Candidate Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting candidate",
      });
    }
    const deleteData = await Candidate.findByIdAndDelete(id);
    if (!deleteData) {
      return res.status(404).json({
        success: false,
        message: "Candidate Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deleteData,
      message: "Candidate Deleted Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// bulk import candidates
// Controller function for bulk import
exports.bulkImportCandidates = async (req, res) => {
  try {
    const candidates = req.body.candidates; // Expect an array of candidate objects in the request body

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: "Please provide a valid array of candidates." });
    }

    // Insert multiple candidates at once
    const insertedCandidates = await Candidate.insertMany(candidates);
    
    res.status(201).json({
      message: "Candidates imported successfully.",
      data: insertedCandidates,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while importing candidates.",
      error: error.message,
    });
  }
};
