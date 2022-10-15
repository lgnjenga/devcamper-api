// Import native node.js path module
const path = require("path");
const express = require("express");
// Middleware for environment variables
const dotenv = require("dotenv");
// Logger Middleware Files
// const logger = require('./middleware/logger');
const morgan = require("morgan");
// Add colors to the console
const colors = require("colors");
// File upload middleware
const fileupload = require("express-fileupload");
// Cookie Parser
const cookieParser = require("cookie-parser");
// Express mongo sanitize middleware
const mongoSanitize = require("express-mongo-sanitize");
// Helmet middleware
const helmet = require("helmet");
// XSS Cleaning middleware
const xss = require("xss-clean");
// Express rate limit middleware
const rateLimit = require("express-rate-limit");
// HPP middleware
const hpp = require("hpp");
// CORS - Cross Origin Resource Sharing - Middleware, make api public
const cors = require("cors");
// Custom local error handler
const errorHandler = require("./middleware/error");
// Database configuration
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to DB
connectDB();

// Routes file
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

// Initialize App
const app = express();

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// // Mount Middleware from file
// app.use(logger);
// Dev logging middleware from npm
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Create Routes
// // Example general route
// app.get('/', (req, res) => {
//     // res.send('<h1>Hello from Express</h1>');
//     // res.send({ name: 'Lawrence' });
//     // res.json({ name: 'Lawrence' });
//     // res.sendStatus(400);
//     // res.status(400).json({ success: false });
//     // res.status(200).json({ success: true, data: { id: 1, task: 'Task One' } });
// });

// Mount fileupload
app.use(fileupload());

// Sanitize Data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
});
app.use(limiter);

// Prevent HTTP param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount Routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
// Mount Error Handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} on PORT: ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});

// To run express app, type the following in the console: npm run dev
// To run express app in production mode, type the following in the console: npm start
