const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000;

const authRouter = require('./routes/authRoutes')
dbConnect();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser());


app.use('/api',authRouter);

app.use(notFound);
app.use(errorHandler)

app.listen(PORT, ()=> {
    console.log(`server is running on port ${PORT}`)
})