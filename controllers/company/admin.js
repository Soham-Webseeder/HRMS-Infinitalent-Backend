const Employee = require("../../models/employee/employee");
const LocationLog = require("../../models/LocationLog");

// --- HELPER ---
// Haversine formula to check if point is within geofence
function isWithinGeofence(point, center, radius) {
  const toRad = deg => deg * Math.PI / 180;
  const [lng1, lat1] = point;
  const [lng2, lat2] = center;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d <= radius;
}

// --- CONTROLLERS ---

// Get Location Logs for a specific Employee
exports.getLocationLogs = async (req, res) => {
  try {
    const { from, to } = req.query;
    const employeeId = req.params.id;

    // Build query to fetch logs from the optimized LocationLog model
    const query = { employee: employeeId };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const logs = await LocationLog.find(query)
      .sort({ timestamp: 1 })
      .lean(); // Faster performance

    return res.status(200).json({ 
      success: true, 
      count: logs.length,
      logs 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get Geofence Breaches for a specific Employee
exports.getGeofenceBreaches = async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    // Pull geofence settings from the unified Employee model
    const employee = await Employee.findById(employeeId).select('geofenceCenter geofenceRadius firstName lastName');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // Find logs marked as 'outside' (using our optimized index)
    const breaches = await LocationLog.find({ 
      employee: employeeId, 
      geofenceStatus: 'outside' 
    }).sort({ timestamp: -1 }).lean();

    return res.status(200).json({ 
      success: true, 
      employeeName: `${employee.firstName} ${employee.lastName || ""}`,
      breaches 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update Geofence settings in the Employee model
exports.updateEmployeeGeofence = async (req, res) => {
  const { id } = req.params;
  const { center, radius } = req.body;

  // Validation
  if (!Array.isArray(center) || center.length !== 2 || typeof radius !== "number") {
    return res.status(400).json({ success: false, message: "Invalid geofence data format." });
  }

  try {
    const updatedEmp = await Employee.findByIdAndUpdate(
      id,
      {
        geofenceCenter: center,
        geofenceRadius: radius,
      },
      { new: true, runValidators: true }
    ).select('firstName lastName geofenceCenter geofenceRadius');

    if (!updatedEmp) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Geofence updated successfully",
      data: updatedEmp,
    });
  } catch (err) {
    console.error("Error updating geofence:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};