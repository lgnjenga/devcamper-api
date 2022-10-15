const express = require("express");

// Import Bootcamps controller file
const {
  getBootcamps,
  getBootcamp,
  postBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

// Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const router = express.Router();

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

// // GET/POST/PUT/DELETE
// // Get All Bootcamps
// router.get('/', (req, res) => {
//     res.status(200).json({ success: true, msg: 'Show All Bootcamps' });
// });
// // Get Single Bootcamp
// router.get('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `Get Single Bootcamp with ID: ${req.params.id}` });
// });
// // Post Bootcamp
// router.post('/', (req, res) => {
//     res.status(200).json({ success: true, msg: 'Post Bootcamp' });
// });
// // Edit Single Bootcamp
// router.put('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `Edit Bootcamp with ID: ${req.params.id}` });
// });
// // Delete Single Bootcamp
// router.delete('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `Delete Bootcamp with ID: ${req.params.id}` });
// });

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), postBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

module.exports = router;
