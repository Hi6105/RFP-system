require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./routes/DB");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const RFP_categories = require("./models/RFP_categories");
const RFP_vendor_details = require("./models/RFP_vendor_details");
const RFP_List = require("./models/RFP_list");
const RFP_quotes = require("./models/RFP_quotes");
const ObjectId = require("mongoose").Types.ObjectId;
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

app.use(express.static(__dirname + "/public"));

// Configuring express-session middleware
app.use(
  session({
    secret: "your_secret_key",
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
  documents = await RFP_categories.find({});
};
obtainCategories();

let vendorList;
const obtainVendors = async () => {
  vendorList = await RFP_vendor_details.find({});
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

app.use("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).send("logout success");
});

app.use("/editDetails", async (req, res) => {
  if (req.session.userType == "vendor") {
    let documents = await RFP_categories.find({ status: "active" });
    res.render("vendor/editDetails", { documents });
  } else res.status(404).send("Page not found");
});

app.use("/create_RFP", async (req, res) => {
  if (req.session.userType == "admin") {
    await obtainCategories();
    await obtainVendors();
    let vendors;
    console.log(req.session.category);
    vendors = await RFP_vendor_details.find({ category: req.session.category });
    const extractedData = vendors.map((vendor) => {
      return { name: vendor.firstName, email: vendor.email };
    });
    req.session.extractedData = extractedData;
    console.log(extractedData);
    res.render("admin/create_RFP", { extractedData });
  } else {
    res.status(404).send("Page not found");
  }
});

app.use("/createQuote", (req, res) => {
  if (req.session.userType == "vendor") res.render("vendor/createQuote");
  else res.status(404).send("Page not found");
});

app.use("/Vendor_RFP_List", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 10 items per page

  try {
    const totalCount = await RFP_List.countDocuments({
      "vendors.id": req.session.userID,
    });
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    const skip = (page - 1) * limit;

    if (req.session.userType == "vendor") {
      let Vendor_RFP_List;
      console.log(req.session.userID);
      Vendor_RFP_List = await RFP_List.find({
        "vendors.id": req.session.userID,
      })
        .skip(skip)
        .limit(limit);
      Vendor_RFP_List = Vendor_RFP_List.map((rfpRecord) => {
        let applied = false;
        rfpRecord.vendors.map((vendor) => {
          if (vendor.id == req.session.userID) {
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
          action: rfpRecord.action,
          applied: applied,
        };
      });
      console.log(Vendor_RFP_List);
      res.render("vendor/Vendor_RFP_List", {
        Vendor_RFP_List,
        page,
        totalPages,
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

app.use("/Home", (req, res) => {
  if (req.session.userType == "admin") res.render("admin/Dashboard");
  else if (req.session.userType == "vendor") res.render("vendor/dashboard");
  else res.status(404).send("Page not found");
});

app.use("/RFP_select_category", async (req, res) => {
  if (req.session.userType == "admin") {
    let documents = await RFP_categories.find({ status: "active" });
    res.render("admin/RFP_select_category", { documents });
  } else res.status(404).send("Page not found");
});

app.use("/RFP_List", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // Default limit to 10 items per page

  try {
    const totalCount = await RFP_List.countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    const skip = (page - 1) * limit;

    if (req.session.userType == "admin") {
      const RFPList = await RFP_List.find({}).skip(skip).limit(limit);

      res.render("admin/RFP_List", { RFPList, page, totalPages });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.use("/approveVendor", approveVendor);
app.use("/addCategory", (req, res) => {
  if (req.session.userType == "admin") {
    res.render("admin/addcategory");
  } else res.status(404).send("Page not found");
});

app.use("/RFP_Quotes", async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 3; // limit to 3 items per page

  try {
    const totalCount = await RFP_quotes.countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    const skip = (page - 1) * limit;

    if (req.session.userType == "admin") {
      let data = [];
      const RFP_Quotes = await RFP_quotes.find({}).skip(skip).limit(limit);
      const RFP_list = await RFP_List.find({});
      for (let i = 0; i < RFP_Quotes.length; i++) {
        const vendor = await RFP_vendor_details.findOne({
          vendorID: RFP_Quotes[i].vendorID,
        });
        console.log(vendor);
        const rfpNo = RFP_Quotes[i].rfpNo;
        const rfp = RFP_list.find((obj) => obj.rfpNo === rfpNo);
        data.push({
          rfpNo: rfpNo,
          serialNumber: vendor.serialNumber,
          itemName: rfp.itemName,
          vendorPrice: RFP_Quotes[i].vendorPrice,
          quantity: RFP_Quotes[i].quantity,
          totalCost: RFP_Quotes[i].totalCost,
        });
      }

      console.log(data);

      res.render("admin/RFP_quotes", { data, page, totalPages });
    } else res.status(404).send("Page not found");
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/addCategoryRequest", addCategory);
app.use("/signupPage", (req, res) => {
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
  let limit = parseInt(req.query.limit) || 3; // Default limit to 10 items per page

  try {
    const totalCount = await RFP_categories.countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    const skip = (page - 1) * limit;
    if (req.session.userType == "admin") {
      const documents = await RFP_categories.find({}).skip(skip).limit(limit);

      res.render("admin/categories", { documents, page, totalPages });
    } else res.status(404).send("Page not found");
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
    const totalCount = await RFP_vendor_details.countDocuments({});
    const totalPages = Math.ceil(totalCount / limit);

    // Ensure page is within bounds
    page = Math.min(Math.max(page, 1), totalPages);

    const skip = (page - 1) * limit;
    if (req.session.userType == "admin") {
      const vendorList = await RFP_vendor_details.find({})
        .skip(skip)
        .limit(limit);

      res.render("admin/Vendor", { vendorList, page, totalPages });
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
  let documents = await RFP_categories.find({});
  res.render("vendor/vendorRegistration", { documents });
});
app.use("/signup", signup);

app.use("/", (req, res) => {
  res.render("login");
});

app.listen(3000);
