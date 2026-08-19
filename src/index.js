// require('dotenv').config({path : `./env`}) disturb the consistency of the code

import dotenv from "dotenv";

import connectDB from "./db/index.js";

import mongoose from "mongoose";

dotenv.config({ path: "./env" });

connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(`Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err) =>{
    console.log("MONGO db connection failed!!!" , err);
    
})

























/* 1ST APPROACH
import express from "express"
const app = express()

// IFEE
(async () => {
  try {
    //connection of database
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error" , (error) => {
        console.log("ERROR :",error);
        throw error
    })

    app.listen(process.env.PORT, () =>{
        console.log(`App is listening on port ${process.env.PORT}`);
        
    })
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  }
})();
*/
