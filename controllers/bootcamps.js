// Import native node.js path module
const path = require('path');
// Import ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');
// Import AsyncHandler 
const asyncHandler = require('../middleware/async');
// Import Geocoder 
const geocoder = require('../utils/geocoder');
// Import Bootcamp model
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// @desc    Get All Bootcamps
// @route   GET /api/v1/bootcamps
// @access  PUBLIC
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    
    
    // res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
    res.status(200).json(res.advancedResults);
    
    // res.status(200).json({ success: true, msg: 'Show All Bootcamps' });
    // res.status(200).json({ success: true, msg: 'Show All Bootcamps', hello: req.hello });
});

// @desc    Get Single Bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  PUBLIC
exports.getBootcamp = asyncHandler(async (req, res, next) => {
   
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // return res.status(400).json({ success: false });
        return next(new ErrorResponse(`Bootcamp not found with ID of: ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp });
    
    // res.status(200).json({ success: true, msg: `Get Single Bootcamp with ID: ${req.params.id}` });
});

// @desc    Create Single Bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  PRIVATE
exports.postBootcamp = asyncHandler(async (req, res, next) => {
    // console.log(req.body);
    // res.status(200).json({ success: true, msg: 'Create New Bootcamp' });

    // Add user to req.body
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with id ${req.user.id} has already publsihed a bootcamp`, 400));
    }
   
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ success: true, data: bootcamp });
        
});

// @desc    Update Bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  PRIVATE
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    // res.status(200).json({ success: true, msg: `Edit Bootcamp with ID: ${req.params.id}` });
   
    // const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // return res.status(400).json({ success: false });
        return next(new ErrorResponse(`Bootcamp not found with ID of: ${req.params.id}`, 404));
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID: ${req.params.id} is not authorized to update this Bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({ success: true, data: bootcamp });
        
});

// @desc    Delete Single Bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  PRIVATE
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // res.status(200).json({ success: true, msg: `Delete Bootcamp with ID: ${req.params.id}` });
   
    // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // return res.status(400).json({ success: false });
        return next(new ErrorResponse(`Bootcamp not found with ID of: ${req.params.id}`, 404));
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID: ${req.params.id} is not authorized to delete this Bootcamp`, 401));
    }

    bootcamp.remove();
    
    res.status(200).json({ success: true, data: {} });
});

// @desc    Get Bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  PRIVATE
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calculate radius using radians
    // Divide distance by radius of the Earth
    // Earth radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });  

});

// @desc    Upload Photo
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  PRIVATE
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID of: ${req.params.id}`, 404));
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID: ${req.params.id} is not authorized to update this Bootcamp`, 401));
    }

    // bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    //     new: true,
    //     runValidators: true
    // });

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file...`, 404));
    }

    const file = req.files.file;
    // console.log(file);

    // Make sure file is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    // console.log(file.name);

    // move file to directory and update bootcamp by ID
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.err(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({ success: true, data: file.name });
    });

});





