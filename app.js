const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const cors = require('cors');
const compression = require('compression');

const index = require('./src/routes/index');
const lapstat = require('./src/routes/lapstat');
const cacheStorage = require('./src/lapstat/cache/storage');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(compression());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/lapstat', lapstat);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

setInterval(function () {
    const dataPro = lapstat.getData('pro');
    const dataSemipro = lapstat.getData('semipro');
    const dataAm = lapstat.getData('am');

    dataPro.then(function (result) {
        cacheStorage.set('times_pro', result);
    });

    dataSemipro.then(function (result) {
        cacheStorage.set('times_semipro', result);
    });

    dataAm.then(function (result) {
        cacheStorage.set('times_am', result);
    });

}, 1000 * 60);

module.exports = app;
