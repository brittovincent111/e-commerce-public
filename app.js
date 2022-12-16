require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session=require('express-session')
const hbs=require('express-handlebars');
const bodyParser = require('body-parser');




const adminRouter = require('./routes/admin');   
const usersRouter = require('./routes/users');

const app = express();
const db=require('./config/connection')

// view engine setup 
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials',
helpers: {
  inc: function (value, options) {
    return parseInt(value) + 1;
  }
}

}))

var Hbs =hbs.create({})

Hbs.handlebars.registerHelper('if_eq', function(a,b,opts) {
  if(a == b)
    return opts.fn(this)
  else
    return opts.inverse(this);
})


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/admin')));
app.use(express.static(path.join(__dirname, 'public/admin/vendors')));
app.use(express.static(path.join(__dirname, 'public/admin/css')));



app.use(express.static(path.join(__dirname, 'public/user')));
app.use(express.static(path.join(__dirname, 'public/user/assets/css')));
app.use(express.static(path.join(__dirname, 'public/user/assets/js')));
app.use(express.static(path.join(__dirname, 'public/user/assets/image')));
app.use(express.static(path.join(__dirname, 'public/image')));




 

app.use(session({secret:"key"},

{cookie:{maxAge:6000}},
))
db.connect((err)=>{
  if(err) console.log('connection error' + err)
  else console.log("database connected")
})
app.use((req, res, next) => {
  if (!req.user) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});
app.use((req, res, next) => {
  if (!req.admin) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('404page');
});

module.exports = app;
