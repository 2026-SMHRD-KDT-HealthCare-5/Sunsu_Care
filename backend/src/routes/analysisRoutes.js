// const express = require('express');
// const multer = require('multer');
// const analysisController = require('../controllers/analysisController');

// const router = express.Router();

// const upload = multer({
//   dest: 'uploads/',
// });

// router.post(
//   '/analyze',
//   upload.single('ingredient_image'),
//   analysisController.analyze
// );

// router.get(
//   '/analyses',
//   analysisController.getAnalysisHistory
// );

// router.get(
//   '/analyses/:analysis_idx',
//   analysisController.getAnalysisDetail
// );

// router.get(
//   '/recommendations',
//   analysisController.getRecommendations
// );

// module.exports = router;