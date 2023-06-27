import mongoose from "mongoose";


const studentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,                      
    },
    batchNo:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    currentMentor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"mentor",
        default:null,
    },
    previousMentor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"mentor",
        default:null,
    },
})

const mentorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    students:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"students",
        default:null,
        unique:true
    },],
})

const Mentor = mongoose.model("mentor",mentorSchema)
const Student = mongoose.model("student",studentSchema)
export default {Student, Mentor} 

