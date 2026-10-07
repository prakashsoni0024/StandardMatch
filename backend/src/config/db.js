import mongoose, { mongo } from "mongoose"
import config from "./config.js";


const connectToDB = async() => {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database set succefully")

}

export default connectToDB