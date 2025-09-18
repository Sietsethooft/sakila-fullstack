require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./src/utils/logger');
const expressLayouts = require('express-ejs-layouts');

const dashboardRouter = require('./src/routes/dashboardRoutes');
const aboutRouter = require('./src/routes/aboutRoutes');
const clientRouter = require('./src/routes/clientRoutes');
const authRouter = require('./src/routes/authRoutes');
const movieRouter = require('./src/routes/movieRoutes');
const rentalRouter = require('./src/routes/rentalRoutes');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Log all requests except static files
app.use((req, res, next) => {
  const excludedPaths = [
    '/stylesheets/style.css',
    '/favicon.ico'
  ];
  if (
    !excludedPaths.includes(req.url) &&
    !req.url.startsWith('/javascripts/')
  ) {
    logger.http(`${req.method} ${req.url}`);
  }
  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// JWT Middleware : set user info in res.locals if token is valid
app.use((req, res, next) => {
  const jwt = require('jsonwebtoken');
  const token = req.cookies.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }
  jwt.verify(token, 'secretkey', (err, decoded) => {
    res.locals.user = err ? null : decoded;
    next();
  });
});

app.use((req, res, next) => { // Middleware to set default locals
  res.locals.showFooter = true;
  next();
});

// Layouts activation
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Routes
app.use('/', dashboardRouter);

app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/about', aboutRouter);
app.use('/clientManagement', clientRouter);
app.use('/movieManagement', movieRouter);
app.use('/rentalManagement', rentalRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('pages/error');
});

module.exports = app;
