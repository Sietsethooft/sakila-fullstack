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

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Log all requests
app.use((req, res, next) => {
  const excludedPaths = ['/stylesheets/style.css'];
  if (!excludedPaths.includes(req.url)) {
    logger.http(`${req.method} ${req.url}`);
  }
  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => { // Middleware to set default locals
  res.locals.showFooter = true;
  next();
});

// Layouts activation
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Routes
app.use('/', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/about', aboutRouter);
app.use('/clientManagement', clientRouter);

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
