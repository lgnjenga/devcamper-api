// Import ErrorResponse Class
const ErrorResponse = require("../utils/errorResponse");
// Import AsyncHandler
const asyncHandler = require("../middleware/async");
// Import Course model
const Review = require("../models/Review");
// Import Course model
const Bootcamp = require("../models/Bootcamp");

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  PUBLIC
exports.getReviews = asyncHandler(async (req, res, next) => {
  // let query;

  // Check if bootcampId is present in the url parameters
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else {
    // query = Course.find().populate({
    //     path: 'bootcamp',
    //     select: 'name description'
    // });

    res.status(200).json(res.advancedResults);
  }

  // reviews = await query;

  // res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  PUBLIC
exports.getSingleReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Access denied to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Access denied to update review`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
