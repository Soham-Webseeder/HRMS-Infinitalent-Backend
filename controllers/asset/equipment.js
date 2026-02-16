const Equipment = require("../../models/asset/equipment");

// Create Equipment
exports.createEquipment = async (req, res) => {
  try {
    const assetId = req.params.id;
    const data = req.body;
    if (!assetId) {
      return res.status(401).json({
        success: false,
        message: "Asset Id is required",
      });
    }
    const equipment = await Equipment.create({ ...data });
    return res.status(200).json({
      success: true,
      data: equipment,
      message: "Equipment Created Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Equipments with pagination
exports.getAllEquipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Create filter object based on query parameters
    let filter = {};
    if (name) {
      filter.equipmentName = { $regex: name, $options: "i" };
    }

    console.log("Filter Object:", filter); // Log the filter object

    // Fetch equipments based on the filter and pagination
    const equipment = await Equipment.find(filter).skip(skip).limit(limit);

    const totalEquipment = await Equipment.countDocuments(filter);
    const totalPages = Math.ceil(totalEquipment / limit);

    if (!equipment || equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: equipment,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEquipment: totalEquipment,
      },
      message: "Equipments Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get All Equipments
exports.getEquipments = async(req,res)=>{
  const data = await Equipment.find({})
  if(!data){
    return res.status(404).json({
      success:false,
      message:"Equipments Not Found",
    })
  }
  return res.status(200).json({
    success:true,
    message:"Equipment Fetched Successfully..",
    data:data
  })
}
// Get Equipment By Employee Name

exports.getEquipmentsByEmployeeName = async (req, res) => {
  const employeeName = req.query.employeeName; // Assuming you are passing employeeName as a query parameter
  try {
    const equipment = await Equipment.find({}).populate({
      path: 'employee',
      match: { name: employeeName }, // Assuming the field for employee name is 'name'
      select: 'name' // Only selecting the 'name' field from employee
    }).select('equipmentName typeName model serialNo'); // Selecting desired fields from equipment

    if (!equipment || equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: equipment,
      message: "Equipments Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Equipment By Id
exports.getEquipmentById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for getting Equipment",
      });
    }
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "equipment Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: equipment,
      message: "equipment Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Equipment
exports.updateEquipment = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for updating Equipment",
      });
    }
    const dataToBeUpdate = await Equipment.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!dataToBeUpdate) {
      return res.status(404).json({
        success: false,
        message: "Equipment Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: dataToBeUpdate,
      message: "Equipment Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting equipment",
      });
    }
    const equipmentToBeDeleted = await Equipment.findByIdAndDelete(id);
    if (!equipmentToBeDeleted) {
      return res.status(404).json({
        success: false,
        message: "Equipment Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: equipmentToBeDeleted,
      message: "Equipment Deleted Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
