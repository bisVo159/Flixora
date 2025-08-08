import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        console.log("Connecting to MongoDB...");
        const uri = process.env.MONGODB_URI;
        const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`);
        console.log(`\nConnected to MongoDB database: ${DB_NAME} !! DB HOST: ${
            connectionInstance.connection.host
        } PORT: ${connectionInstance.connection.port}\n`);

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;