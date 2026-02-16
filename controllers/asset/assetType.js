const AssetType = require("../../models/asset/assetType");
// Create Asset
exports.createAssetType = async (req, res) => {
  try {
    const val = req.body;
    const assetType = await AssetType.create({ ...val });
    if (!assetType) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: assetType,
      message: "Asset Type Created....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Asset Types with pagination
// exports.getAllAssetType = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 5;
//     const skip = (page - 1) * limit;
//     const { name } = req.query;

//     // Build the filter object
//     let filter = {};
//     if (name) {
//       filter.typeName = { $regex: name, $options: "i" }; // Case-insensitive search
//     }

//     // Fetch asset types based on the filter and pagination
//     const assets = await AssetType.find(filter).skip(skip).limit(limit);

//     const totalAssets = await AssetType.countDocuments(filter);
//     const totalPages = Math.ceil(totalAssets / limit);

//     if (!assets || assets.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No Data Found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: assets,
//       pagination: {
//         currentPage: page,
//         totalPages: totalPages,
//         totalAssets: totalAssets,
//       },
//       message: "Assets Fetched Successfully...",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Get All Asset Types with pagination
exports.getAllAssetType = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) ||5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.typeName = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    // Log the filter to ensure it's being constructed correctly
    console.log("Filter Object:", filter);

    // Fetch asset types based on the filter and pagination
    const assets = await AssetType.find(filter).skip(skip).limit(limit);

    // Count total documents that match the filter
    const totalAssets = await AssetType.countDocuments(filter);
    const totalPages = Math.ceil(totalAssets / limit);

    if (!assets || assets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalAssets: totalAssets,
      },
      message: "Assets Fetched Successfully...",
    });
  } catch (error) {
    console.error("Error fetching asset types:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};


// Get All Asset Types
exports.getAssetTypes = async(req,res)=>{
  const data = await AssetType.find({})
  if(!data){
    return res.status(404).json({
      success:false,
      message:"No Asset Type Found"
    })
  }
  return res.status(200).json({
    success:true,
    message:"Asset Type found successfully..",
    data:data
  })
}
// Get Asset By Id
exports.getAssetById = async (req, res) => {
  try {
    const assetId = req.params.id;
    if (!assetId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for fetching Asset",
      });
    }
    const asset = await AssetType.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: asset,
      message: "Asset Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Assets Type
exports.updateAssetsType = async (req, res) => {
  try {
    const assetId = req.params.id;
    const data = req.body;
    if (!assetId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for updating Asset",
      });
    }
    const dataToBeUpdate = await AssetType.findByIdAndUpdate(assetId, data, {
      new: true,
    });
    if (!dataToBeUpdate) {
      return res.status(404).json({
        success: false,
        message: "Asset Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: dataToBeUpdate,
      message: "Asset Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Asset type
exports.deleteAssetType = async (req, res) => {
  try {
    const assetId = req.params.id;
    if (!assetId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting Asset",
      });
    }
    const assetToBeDeleted = await AssetType.findByIdAndDelete(assetId);
    if (!assetToBeDeleted) {
      return res.status(404).json({
        success: false,
        message: "Asset Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: assetToBeDeleted,
      message: "Asset Deleted Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
