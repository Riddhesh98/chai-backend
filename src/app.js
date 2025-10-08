import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

app.use(express.json({limit:"16kb"}));

app.use(urlencoded({extended:true, limit:"16kb"}));

app.use(express.static('public'));
app.use(cookieParser());

//import routes
    //as route is default export  
    //so we can give own name like below userRoutes
    import userRouter from "./routes/user.routess.js"




//routes declaration
app.use("/api/v1/users", userRouter)

export {app};