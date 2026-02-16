const Event = require("../../models/Event/Event");

exports.createEvent = async (req, res) => {
  try {
    const log = new Event(req.body);
    await log.save();

    return res.status(200).json({
      success: true,
      data: log,
      message: "log Created Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.allEvent = async(req,res)=>{
    try{
        const event = await Event.find({});

        return res.status(200).json({
            success: true,
            data: event,
            message: "log Created Successfully...",
          });
} catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

}

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLog = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedLog,
      message: "Log Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Event By Id

exports.getEventById = async(req,res)=>{
  const id = req.params.id
  const event = await Event.findById(id)
  if(!event){
    return res.status(404).json({
      success:false,
      message:"No Events Found"
    })
  }
  return res.status(200).json({
    success:true,
    data:event,
    message:"Event Fetched Successfully..."
  })
}
// Delete Log
exports.deletedEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await Event.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: deletedLog,
      message: "Log Deleted Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};