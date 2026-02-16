  const jwt = require("jsonwebtoken");
  const dotenv = require("dotenv");
  dotenv.config();

  exports.auth = async (req, res, next) => {
    try {
      const token =
        req.cookies.token ||
        req.body.token ||
        req.header("Authorization")?.replace("Bearer ", ""); // Added space after Bearer

      if (!token) {
        return res.status(401).json({
          success: false,
          message: `Token Missing`,
        });
      }

      try {
        // Decode will now likely look like: { id: "123", role: "admin" }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decode; 

      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid",
        });
      }
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: `Something Went Wrong While Validating the Token`,
      });
    }
  };

  // Check if user is an Admin
  exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for Admins only",
      });
    }
    next();
  };

  // Check if user is HR (or Admin, as Admins usually have HR powers)
  exports.isHR = (req, res, next) => {
    if (req.user.role !== "hr" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for HR/Admin only",
      });
    }
    next();
  };