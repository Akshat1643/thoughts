const mongoose = require("mongoose")
mongoose.connect(process.env.db);
const express = require('express')
const app = express();
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
app.listen(3000,()=>{
    console.log("hanji chal raha ha")
})
//2dK3LU0lWRpCRYPG
