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

// Configure express-session middleware
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

app.use("/create_RFP", async (req, res) => {
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
});

app.use("/createQuote", (req, res) => {
  res.render("vendor/createQuote");
});

app.use("/Vendor_RFP_List", async (req, res) => {
  let Vendor_RFP_List;
  console.log(req.session.userID);
  Vendor_RFP_List = await RFP_List.find({ "vendors.id": req.session.userID });
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
  res.render("vendor/Vendor_RFP_List", { Vendor_RFP_List });
});

app.use("/Home", (req, res) => {
  if (req.session.userType == "admin") res.render("admin/Dashboard");
  else res.render("vendor/dashboard");
});

app.use("/RFP_select_category", (req, res) => {
  res.render("admin/RFP_select_category", { documents });
});

app.use("/RFP_List", async (req, res) => {
  let RFPList;
  RFPList = await RFP_List.find({});
  res.render("admin/RFP_List", { RFPList });
});
app.use("/approveVendor", approveVendor);
app.use("/addCategory", (req, res) => {
  res.render("admin/addcategory");
});

app.use("/RFP_Quotes", async (req, res) => {
  let data = [];
  const RFP_Quotes = await RFP_List.find({
    userID: req.session.userID,
    "vendors.applied": true,
  });
  await Promise.all(
    RFP_Quotes.map(async (rfpRecord) => {
      let vendorId, vendorRecord, quoteRecord;
      await Promise.all(
        rfpRecord.vendors.map(async (vendor) => {
          try {
            const vendorRecord = await RFP_vendor_details.findOne({
              _id: new ObjectId(vendor.id),
            });
            if (vendorRecord) {
              vendorId = vendorRecord.serialNumber;
              quoteRecord = await RFP_quotes.findOne({
                vendorID: vendorRecord._id,
              });
              // Do something with quoteRecord
            }
          } catch (err) {
            console.error(err);
          }
        })
      );
      data.push({
        rfpNo: rfpRecord.rfpNo,
        itemDescription: rfpRecord.itemName,
        vendorID: vendorId,
        vendorPrice: quoteRecord ? quoteRecord.vendorPrice : null,
        quantity: quoteRecord ? quoteRecord.quantity : null,
        totalCost: quoteRecord ? quoteRecord.totalCost : null,
      });
    })
  );

  console.log(data);

  res.render("admin/RFP_quotes", { data });
});

app.use("/addCategoryRequest", addCategory);
app.use("/signupPage", (req, res) => {
  res.render("signup");
});
app.use("/adminLayout", (req, res) => {
  res.render("layouts/adminLayout");
});
app.use("/admin", (req, res) => {
  res.render("admin/Dashboard");
});
app.use("/categories", async (req, res) => {
  let documents = await RFP_categories.find({});
  res.render("admin/categories", { documents });
});
app.use("/vendorData", async (req, res) => {
  vendorList = await RFP_vendor_details.find({});
  res.render("admin/Vendor", { vendorList });
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
