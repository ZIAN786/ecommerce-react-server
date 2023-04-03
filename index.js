import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import morgan from "morgan";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import cors from "cors";



dotenv.config();

const app = express();


//database connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => console.log("DB Connected"))
.catch(err => console.log("DB Error =>", err));

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//router middleware
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);




const port = process.env.PORT || 8000;

app.listen(8000, () => {
    console.log (`Node server is running on port ${port}`);
});


