import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("Server error:", err);
        throw err;
    });
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
);

















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