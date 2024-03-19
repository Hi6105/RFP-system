const express = require('express');
const router = express.Router();
const path = require('path');



router.post('/', (req, res) => {
  
  // Send the uploaded file to the calling route
  const filePath = path.join(__dirname, '..', 'public', 'category', 'SampleCategories.xlsx');
  res.sendFile(filePath);
});

module.exports = router;
