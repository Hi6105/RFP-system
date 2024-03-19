require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./routes/DB");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const rfpCategories = require("./models/rfpCategories");
const rfpVendorDetails = require("./models/rfpVendorDetail");
const RFP_List = require("./models/rfpList");
const RFP_quotes = require("./models/rfpQuotes");
const rfpUserDetails = require("./models/rfpUserDetails");
const rfpCompany = require("./models/company");
const path = require("path");

db();

// Create a MongoDB session store
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/RFP",
  collection: "sessions",
});

// Catch errors in the session store
store.on("error", function (error) {
  console.error("Session Store Error:", error);
});

app.use(express.static(path.join(__dirname, "public")));

// Configuring express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
let documents;
const obtainCategories = async () => {
  documents = await rfpCategories.find({});
};
obtainCategories();

let vendorList;
const obtainVendors = async () => {
  vendorList = await rfpVendorDetails.find({});
};
obtainVendors();

const signup = require("./routes/signup");
const addCategory = require("./routes/addCategory");
const approveVendor = require("./routes/approveVendor");
const login = require("./routes/login");
const verifyOtp = require("./routes/verifyOTP");
const addVendor = require("./routes/addVendor");
const vendorVerifyOtp = require("./routes/vendorVerifyOtp");
const setCategory = require("./routes/setCategory");
const createRFP = require("./routes/createRFP");
const applyRFP = require("./routes/applyRFP");
const addQuote = require("./routes/addQuote");
const forgotPassword = require("./routes/forgotPassword");
const verifyOTPreset = require("./routes/verifyOTPreset");
const resetPassword = require("./routes/resetPassword");
const categoryStatusUpdate = require("./routes/categoryStatusUpdate");
const rfpStatusUpdate = require("./routes/rfpStatusUpdate");
const editVendorDetails = require("./routes/editVendorDetails");
const downloadRFPList = require("./routes/downloadRFP");
const uploadCategory = require("./routes/uploadCategory");
const setAdminRole = require("./routes/setAdminRole");
const addSubAdmin = require("./routes/addSubAdmin");
const setCompany = require("./routes/setCompany");
const downloadSampleCategories = require("./routes/downloadSampleCategory");


app.use("/downloadSampleCategories", downloadSampleCategories);
app.use("/setCompany", setCompany);
app.use("/addSubAdmin", addSubAdmin);
app.use("/setAdminRole", setAdminRole);
app.use("/uploadCategory", uploadCategory);
app.use("/downloadRFPList", downloadRFPList);
app.use("/editVendorDetails", editVendorDetails);
app.use("/rfpStatusUpdate", rfpStatusUpdate);
app.use("/resetPasswordRoute", resetPassword);
app.use("/verifyOTPreset", verifyOTPreset);
app.use("/forgotPasswordRoute", forgotPassword);
app.use("/createRFP", createRFP);
app.use("/vendorVerifyOtp", vendorVerifyOtp);
app.use("/addVendor", addVendor);
app.use("/verifyOtp", verifyOtp);
app.use("/login", login.router);
app.use("/setCategory", setCategory);
app.use("/applyRFP", applyRFP);
app.use("/addQuote", addQuote);
app.use("/categoryStatusUpdate", categoryStatusUpdate);

app.use("/assignRoles", (req, res) => {
  const userType = req.session.userType;
  res.render("admin/assignRole", { userType });
});

app.use("/selectCompany", async (req, res) => {
  const companies = await rfpCompany.find({});
  res.render("vendor/selectCompany", { companies });
});

app.use("/accessRoles", async (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin") {
    const subAdmins = await rfpUserDetails.find({
      companyID: req.session.companyID,
      userType: { $in: ["Accounts", "Procurement Manager"] },
    });
    let serialNumber = 1;
    res.render("admin/accessRole", { subAdmins, serialNumber, userType });
  } else res.status(404).send("Page not Found");
});

app.use("/selectAdminRole", (req, res) => {
  res.render("selectAdminRole");
});

app.use("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).send("logout success");
});

app.use("/editDetails", async (req, res) => {
  const userType = req.session.userType; 
  if (userType == "vendor") {
    let documents = await rfpCategories.find({ status: "active" });
    res.render("vendor/editDetails", { documents ,userType});
  } else res.status(404).send("Page not found");
});

app.use("/create_RFP", async (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin" || userType == "Procurement Manager") {
    await obtainCategories();
    await obtainVendors();
    let vendors;
    vendors = await rfpVendorDetails.find({ category: req.session.category });
    let extractedData = [];
    for (let i = 0; i < vendors.length; i++) {
      const userID = vendors[i].userID;
      const vendor = await rfpUserDetails.findOne({ userID: userID });
      extractedData.push({ email: vendor.email, name: vendor.firstName });
    }
    req.session.extractedData = extractedData;
    res.render("admin/create_RFP", { extractedData, userType });
  } else {
    res.status(404).send("Page not found");
  }
});

app.use("/createQuote", (req, res) => {
  const userType = req.session.userType;
  if (userType == "vendor") res.render("vendor/createQuote", { userType });
  else res.status(404).send("Page not found");
});

app.use("/Vendor_RFP_List", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 10 items per page

  try {
    const companyID = req.session.companyID;
    const totalCount = await RFP_List.countDocuments({
      companyID: companyID,
      "vendors.id": req.session.userID,
    });
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;

    const userType = req.session.userType;

    if (userType == "vendor") {
      let Vendor_RFP_List;
      Vendor_RFP_List = await RFP_List.find({
        companyID: companyID,
        "vendors.userID": req.session.userID,
      })
        .skip(skip)
        .limit(limit);
      Vendor_RFP_List = Vendor_RFP_List.map((rfpRecord) => {
        let applied = false;
        rfpRecord.vendors.map((vendor) => {
          if (vendor.userID == req.session.userID) {
            applied = vendor.applied;
          }
        });
        return {
          userID: rfpRecord.userID,
          rfpNo: rfpRecord.rfpNo,
          itemName: rfpRecord.itemName,
          itemDescription: rfpRecord.itemDescription,
          quantity: rfpRecord.quantity,
          lastDate: rfpRecord.lastDate,
          maxPrice: rfpRecord.maxPrice,
          minPrice: rfpRecord.minPrice,
          status: rfpRecord.status,
          applied: applied,
        };
      });
      console.log(Vendor_RFP_List);
      res.render("vendor/Vendor_RFP_List", {
        Vendor_RFP_List,
        page,
        totalPages,
        userType,
      });
    } else {
      res.status(404).send("Page not found");
    }
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/Home", async (req, res) => {
  const userType = req.session.userType;
  if (
    userType == "Super Admin" ||
    userType == "Accounts" ||
    userType == "Procurement Manager"
  )
    res.render("admin/Dashboard", { userType });
  else if (userType == "vendor") {
    const user = await rfpUserDetails.findOne({ userID: req.session.userID });
    const vendor = await rfpVendorDetails.findOne({ userID: user.userID });
    let formattedPath;
    if (vendor.image) {
      const path = vendor.image.path;
      formattedPath = "public/" + path.replace(/\\/g, "/");
      console.log(path, formattedPath);
    }
    res.render("vendor/dashboard", { formattedPath, userType });
  } else res.status(404).send("Page not found");
});

app.use("/RFP_select_category", async (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin" || userType == "Procurement Manager") {
    let documents = await rfpCategories.find({
      companyID: req.session.companyID,
      status: "active",
    });
    res.render("admin/RFP_select_category", { documents, userType });
  } else res.status(404).send("Page not found");
});

app.use("/RFP_List", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 3 items per page

  try {
    const companyID = req.session.companyID;
    const totalCount = await RFP_List.countDocuments({ companyID: companyID });
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;

    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      const RFPList = await RFP_List.find({ companyID: companyID })
        .skip(skip)
        .limit(limit);

      res.render("admin/RFP_List", { RFPList, page, totalPages, userType });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/approveVendor", approveVendor);
app.use("/addCategory", (req, res) => {
  const userType = req.session.userType;
  if (userType == "Super Admin" || userType == "Procurement Manager") {
    res.render("admin/addcategory", { userType });
  } else res.status(404).send("Page not found");
});

app.use("/RFP_Quotes", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // limit to 3 items per page

  try {
    const companyID = req.session.companyID;
    const totalCount = await RFP_quotes.countDocuments({
      companyID: companyID,
    });
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;

    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      let data = [];
      const RFP_Quotes = await RFP_quotes.find({ companyID: companyID })
        .skip(skip)
        .limit(limit);
      for (let i = 0; i < RFP_Quotes.length; i++) {
        const RFP = await RFP_List.findOne({ rfpNo: RFP_Quotes[i].rfpNo });
        data.push({
          rfpNo: RFP_Quotes[i].rfpNo,
          itemName: RFP.itemName,
          vendorID: RFP_Quotes[i].userID,
          vendorPrice: RFP_Quotes[i].vendorPrice,
          quantity: RFP_Quotes[i].quantity,
          totalCost: RFP_Quotes[i].totalCost,
        });
      }

      res.render("admin/RFP_quotes", { data, page, totalPages, userType });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/addCategoryRequest", addCategory);

app.use("/signupPage", async (req, res) => {
  res.render("signup");
});

app.use("/adminLayout", (req, res) => {
  if (req.session.userType == "admin") res.render("layouts/adminLayout");
  else res.status(404).send("Page not found");
});
app.use("/admin", (req, res) => {
  if (req.session.userType == "admin") res.render("admin/Dashboard");
  else res.status(404).send("Page not found");
});

app.use("/categories", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 3 items per page

  try {
    const totalCount = await rfpCategories.countDocuments({
      companyID: req.session.companyID,
    });
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1); // Ensure at least one page

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    const serialNumber = 1;
    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;
    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      const documents = await rfpCategories
        .find({ companyID: req.session.companyID })
        .skip(skip)
        .limit(limit);

      // Render the view with documents or an empty array if none found
      res.render("admin/categories", {
        documents,
        page,
        totalPages,
        serialNumber,
        userType,
      });
    } else {
      res.status(404).send("Page not found");
    }
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/vendorData", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 10 items per page

  try {
    const companyID = req.session.companyID;
    const totalCount = await rfpVendorDetails.countDocuments({
      companyID: companyID,
    });
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    let skip = (page - 1) * limit;
    if (skip < 0) skip = 0;
    const userType = req.session.userType;
    if (
      userType == "Super Admin" ||
      userType == "Accounts" ||
      userType == "Procurement Manager"
    ) {
      let serialNumber = 1;
      const vendorList = await rfpUserDetails
        .find({ companyID: companyID, userType: "vendor" })
        .skip(skip)
        .limit(limit);

      for (let i = 0; i < vendorList.length; i++) {
        const userID = vendorList[i].userID;
        const vendor = await rfpVendorDetails.findOne({ userID: userID });
        vendorList[i].phoneNumber = vendor.phoneNumber;
        vendorList[i].status = vendor.status;
      }
      console.log(vendorList);
      res.render("admin/Vendor", {
        vendorList,
        page,
        totalPages,
        serialNumber,
        userType,
      });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.use("/EnterOTP", (req, res) => {
  res.render("EnterOTP");
});
app.use("/emailOTP", (req, res) => {
  res.render("emailOTP");
});
app.use("/vendorEmailOTP", (req, res) => {
  res.render("vendor/vendorEmailOTP");
});
app.use("/forgotPassword", (req, res) => {
  res.render("forgotPassword");
});
app.use("/resetPassword", (req, res) => {
  res.render("resetPassword");
});
app.use("/vendorRegistration", async (req, res) => {
  const company = await rfpCompany.findOne({
    companyName: req.session.companyName,
  });
  console.log(company);
  const documents = await rfpCategories.find({
    companyID: company.companyID,
    status: "active",
  });
  res.render("vendor/vendorRegistration", { documents });
});
app.use("/signup", signup);

app.use("/", (req, res) => {
  res.render("login");
});

app.listen(3000);
