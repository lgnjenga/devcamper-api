// Import ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');
// Import AsyncHandler 
const asyncHandler = require('../middleware/async');
// Import Course model
const Course = require('../models/Course');
// Import Course model
const Bootcamp = require('../models/Bootcamp');

// @desc    Get All Course
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  PUBLIC
exports.getCourses = asyncHandler(async (req, res, next) => {
    // let query;

    // Check if bootcampId is present in the url parameters
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        res.status(200).json({ success: true, count: courses.length, data: courses });
    } 
    else {
        // query = Course.find().populate({
        //     path: 'bootcamp',
        //     select: 'name description'
        // });

        res.status(200).json(res.advancedResults);
    }

    // courses = await query;

    // res.status(200).json({ success: true, count: courses.length, data: courses });
});


// @desc    Get a single Course
// @route   GET /api/v1/courses/:id
// @access  PUBLIC
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(
            new ErrorResponse(`No course with the ID of ${req.params.id}`, 404)
        );
    }
    
    res.status(200).json({ success: true, data: course });
});


// @desc    Add Course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  PRIVATE
exports.addCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with the ID of ${req.params.bootcampId}`, 404)
        );
    }

    // Make sure user is course owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID: ${req.user.id} is not authorized to add a course to bootcamp ID: ${bootcamp._id}`, 401));
    }

    const course = await Course.create(req.body);
    
    res.status(200).json({ success: true, data: course });
});


// @desc    Update Course
// @route   PUT /api/v1/courses/:id
// @access  PRIVATE
exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the ID of ${req.params.id}`, 404)
        );
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID: ${req.user.id} is not authorized to update Course ID: ${course._id}`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({ success: true, data: course });
});


// @desc    Delete Course
// @route   DELETE /api/v1/courses/:id
// @access  PRIVATE
exports.deleteCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the ID of ${req.params.id}`, 404)
        );
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID: ${req.user.id} is not authorized to delete Course ID: ${course._id}`, 401));
    }

    await course.remove();
    
    res.status(200).json({ success: true, data: course });
});