if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}


const express = require('express');

const ejsmate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');


const methodOverride = require('method-override');
const passport = require('passport');
const localStartegy = require('passport-local');
const sanitizeV5 = require('./utils/mongoSanitize');
const helmet = require('helmet');


const homeRoutes = require('./routes/home.js')
const userAuth = require('./routes/users.js')
const titlesRoutes = require('./routes/titles.js');
const userRoutes = require('./routes/user.js');

const MongoStore = require('connect-mongo').default;

// const dbUrl = 'mongodb://127.0.0.1:27017/movies-convey';
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/movies-convey';
// const dbUrl = process.env.DB_URL ;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

const app = express();

app.set('query parser', 'extended');


app.engine('ejs', ejsmate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));


const secret = process.env.SECRET || 'Thisisakindofasecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto:{
        secret,
    }
})


store.on('error', function(e){
    console.log("session store error", e)
})

const sessionConfig = {
    store,
    name: 'session', 
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(express.json());
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
    
];
const connectSrcUrls = [
    "https://cdn.jsdelivr.net",
];

const fontSrcUrls = [
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://fonts.gstatic.com",
];

const defaultSrcUrls = [
    "https://www.youtube.com"
];


app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", ...defaultSrcUrls],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://cdn.watchmode.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);






app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStartegy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=> {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})


app.use('/', homeRoutes)
app.use('/', userAuth)
app.use('/titles', titlesRoutes)
app.use('/user', userRoutes)







app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`listing to Port ${port}`)
})