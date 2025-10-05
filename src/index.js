// require("dotenv").config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
});


connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(`\n server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((err)=>{
    console.error("mongo db connection failed !!!:", err);
    throw err;
})


// ;( async() => {
//     try {
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     } catch (error) {
//         console.error( "Error:",error );
//         throw error;
//     }
// } )()