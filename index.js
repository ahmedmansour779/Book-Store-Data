import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';

import routesBlogs from './routes/blog.routes.js';
import routesUsers from './routes/auth.routes.js';
import routesTerms from './routes/term.routes.js';
import routesTestimonials from './routes/testimonials.routes.js';
import routesPortfolio from './routes/portfolio.routes.js';
import routesContact from './routes/contact.routes.js';
import routesJobs from './routes/jobs.routes.js';
import routesPrintStandardService from './routes/standardServices/print.standardService.routes.js';
import routesMarketingStandardService from './routes/standardServices/marketing.standardService.routes.js';
import routesProgrammingStandardService from './routes/standardServices/programming.standardService.routes.js';
import routesCustomServices from './routes/customServices.routes.js';
import routesCustomServicesTypes from './routes/customServicesTypes.routes.js';
import PaymentRoutes from './routes/payment.route.js';
import * as httpStatusText from './utils/constants/http.status.text.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';

// const routesBlogs = require('./routes/blog.routes');
// const routesUsers = require('./routes/auth.routes');
// const routesTerms = require('./routes/term.routes');
// const routesTestimonials = require('./routes/testimonials.routes');
// const routesPortfolio = require('./routes/portfolio.routes');
// const routesContact = require('./routes/contact.routes');
// const routesJobs = require('./routes/jobs.routes');
// const routesPrintStandardService = require('./routes/standardServices/print.standardService.routes.js');
// const routesMarketingStandardService = require('./routes/standardServices/marketing.standardService.routes');
// const routesProgrammingStandardService = require('./routes/standardServices/programming.standardService.routes.js');
// const routesCustomServices = require('./routes/customServices.routes');
// const routesCustomServicesTypes = require('./routes/customServicesTypes.routes.js');
// const PaymentRoutes = require('./routes/payment.route.js');
// const httpStatusText = require('./utils/http.status.text');
// const uploadRoutes = require('./routes/upload.routes.js');
// const adminRoutes = require('./routes/admin.routes.js');
const app = express();
const url = process.env.MONGO_URL;

// -------------------- MongoDB --------------------
mongoose
  .connect(url, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// -------------------- Middlewares --------------------

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// -------------------- Routes --------------------
app.use('/api/blogs', routesBlogs);
app.use('/api/jobs', routesJobs);
app.use('/api/terms', routesTerms);
app.use('/api/testimonials', routesTestimonials);
app.use('/api/portfolio', routesPortfolio);
app.use('/api/contact', routesContact);
app.use('/api/standard-service/print', routesPrintStandardService);
app.use('/api/standard-service/marketing', routesMarketingStandardService);
app.use('/api/standard-service/programming', routesProgrammingStandardService);
app.use('/api/custom-services', routesCustomServices);
app.use('/api/custom-services-types', routesCustomServicesTypes);
app.use('/api/payment', PaymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', routesUsers);
app.use('/api/admin', adminRoutes);

// -------------------- 404 Not Found --------------------
app.use((req, res) => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: 'Route not found',
  });
});

// -------------------- Error Handler --------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      status: 'fail',
      message: 'Only one file is allowed',
    });
  }

  res.status(err.statusCode || 500).json({
    status: httpStatusText.ERROR,
    message: err.message || 'Internal Server Error',
  });
});

// -------------------- Run Server --------------------
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
