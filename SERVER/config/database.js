const mongoose = require('mongoose');

require('dotenv').config();

port = process.env.PORT || 4000 ;

 exports.dbConnection =()=>{ mongoose.connect(process.env.MONGODB_URL).then(
    console.log("Database connection successfully established")
).catch((err)=>{
    console.log("Error connecting to Mongo");
    console.error(err);
})
}

