const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://akshat160403:2dK3LU0lWRpCRYPG@cluster0.8j1lk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
const express = require('express')
const serverless = require('serverless-http');
const app = express();
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
app.listen(3000,()=>{
    console.log("hanji chal raha ha")
})
module.exports = app;
module.exports.handler = serverless(app);
//2dK3LU0lWRpCRYPG