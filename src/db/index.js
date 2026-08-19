import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// DB is in another continent
const connectDB = async () =>{
    try {
       const connectionInstance =  await mongoose.connect(process.env.MONGODB_URI);
       console.log(`\n MongoDB connected!! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        //error handling
        console.log("MONGODB connection error : " ,error);
        process.exit(1)
    }
}

export default connectDB