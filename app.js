var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
// const { startHeartBeating } = require("./discovery/discovery")

var indexRouter = require('./routes/index');
const { registerMailingSchedular } = require('./services/scheduler/schedular');


var app = express();
dotenv.config()

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Do-It API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/auth/*.js', './routes/todos/*.js'], // files containing annotations as above
};

const swaggerDocs = swaggerJsDoc(options);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs))

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true
}).then(() => {
  console.log("Connected to db")
}).catch(e => {
  console.error(e)
  process.exit(1)
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

// Register schedular
registerMailingSchedular()

//startHeartBeating()

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



module.exports = app;
