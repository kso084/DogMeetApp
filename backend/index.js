const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
const app = express();

// MongoDB
const mongoUrl = process.env.MONGODBURL || "somemongodbhere";
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('DB CONNECTED');
    db = mongoose.connection;
})
.catch(e => console.log(`DB CONNECTION ERROR: ${e}`));


// Middleware
const sessionSecret = process.env.SECRET || "mylittlesecretsentence";
app.use(cors({credentials: true, origin: process.env.FRONTENDURL}));
app.use(cookieParser());
app.use(express.json({limit: '20mb'}));
app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/user", require('./routes/users'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Incoming bits on port ${port}`));