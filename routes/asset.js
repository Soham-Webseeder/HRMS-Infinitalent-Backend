const express = require("express");
const {
  createAssetType,
  getAllAssetType,
  getAssetById,
  updateAssetsType,
  deleteAssetType,
  getAssetTypes,
} = require("../controllers/asset/assetType");
const {
  createEquipment,
  getAllEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentsByEmployeeName,
  getEquipments,
} = require("../controllers/asset/equipment");
const {
  createAssetAssign,
  getAssetAssignById,
  getAllAssetAssigns,
  updateAssetAssign,
  deleteAssetAssign,
  getAssetAssignByEmployee,
} = require("../controllers/asset/assetAssign");
const router = express.Router();

// Asset Type Routes
router.post("/createAssetType", createAssetType);
router.get("/getAllAssetTypes", getAllAssetType);// Asset Type for pagination
router.get("/get-all-assetTypes",getAssetTypes)
router.get("/getAssetById/:id", getAssetById); // Asset id
router.patch("/updateAsset/:id", updateAssetsType);
router.delete("/deleteAsset/:id", deleteAssetType);

// Equipment Routes
router.post("/createEquipment/:id", createEquipment); // Asset id will be pass to create Equipment
router.get("/getAllEquipment", getAllEquipments);// Equipment for pagination
router.get("/get-equipments",getEquipments)
router.get("/getEquipmentByEmployeeName", getEquipmentsByEmployeeName);
router.get("/getEquipmentById/:id", getEquipmentById); // Equipment id
router.patch("/updateEquipment/:id", updateEquipment); // Equipment id
router.delete("/deleteEquipment/:id", deleteEquipment); // Equipment id

// Asset Assignment Routes
router.post("/createAssetAssign", createAssetAssign);
router.get("/getAssetAssignById/:id", getAssetAssignById);
router.get("/getAllAssetAssign", getAllAssetAssigns);
router.patch("/updateAssetAssign/:id", updateAssetAssign);
router.delete("/deleteAssetAssign/:id", deleteAssetAssign);
router.get("/getAssetByEmployee/:id",getAssetAssignByEmployee)

module.exports = router;
