import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";

dotenv.config({
    path: "./.env"
});

const app = express();

connectDB()

















// (async ()=>{
//     try {
//         const dbName = process.env.DB_NAME || "videotube";
//         const uri = process.env.MONGODB_URI;
//         await mongoose.connect(`${uri}/${dbName}`, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         });
//         console.log(`Connected to MongoDB database: ${dbName}`);
        
//         app.on("error", (err) => {
//             console.error("Server error:", err);
//             throw err;
//         })

//         app.listen(process.env.PORT || 8000, () => {
//             console.log(`Server is running on port ${process.env.PORT || 8000}`);
//         });
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }
// })()