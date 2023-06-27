import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
import cors from 'cors'

import model from './models/model.js';
const { Student, Mentor } = model

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
        origin:true,
    }));
dotenv.config()
const port = process.env.PORT


//Connect to Mongoose DB 

mongoose.connect("mongodb://0.0.0.0:27017/StudentMentorDB" , {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("Connected to database")
})
.catch((err)=>{
    console.log(err)
})



//-----------------------------------------------------------------------------------------\\

// 1 Create Mentor 

    app.post('/createMentor', async (req,res)=>{
        const mentor = new Mentor ({
            name: req.body.name,
            subject: req.body.subject,
            students:[],
        })

        await mentor.save()
        .then(()=>{
            res.send("Mentor created successfully")
        })
        .catch((err)=>{
            console.log(err)
        })
    })


// 2 Create Student
app.post('/createStudent',(req,res)=>{
    const student = new Student ({
        name: req.body.name,
        batchNo: req.body.batchNo,
        age: req.body.age,
    })

    student.save()
    .then(()=>{
        res.send("Student created successfully")
    })
    .catch((err)=>{
        console.log(err)
    })
})

// 3 Write API to Assign a student to Mentor

    // A student who has a mentor should not be shown in List (GET REQUEST FOR LIST)

    app.get('/getStudentNoMentor',(req,res)=>{
        Student.find()
        .then((students)=>{
            const noMentorStudent = students.filter((student)=>{
                return student.currentMentor == null
            })
            res.send(noMentorStudent)
        })

        .catch((err)=>{
            console.log(err)
        })
    })

    // Select one mentor and Add multiple Student (PUT REQUEST) AND ASSIGN MENTOR TO A STUDENT

    app.put('/assignStudent',async (req,res)=>{
       const studentNames = req.body.studentNames
        await studentNames.map(async (studentName)=>{
            // Adding Student to Mentor
            await Student.findOne({name:studentName})
            .then(async (student)=>{
                if(student != null){
                    const mentor = await Mentor.findOne({name: req.body.mentorName})
                    if (mentor != null){
                        mentor.students.push(student._id)
                        await mentor.save()

                    // Simutaneously Adding Mentor to Student
                        student.previousMentor = student.currentMentor
                        student.currentMentor = mentor._id
                        await student.save()

                        res.write("Mentor has been assigned to students and vice versa")
                        res.end()
                    }
                    else{
                        console.log(`${req.body.mentorName} is not a mentor`)
                    }
                }
                else{
                    console.log(`${studentName} is not a Student`)
                }
            })
            .catch((err)=>{
                console.log(err)
            })

       })
        

    })



    // 4 Write API to Assign or Change Mentor for particular Student
    // Select One Student and Assign/Change one Mentor

    app.put('/changeMentor',async (req,res)=>{
        await Student.findOne({name:req.body.studentName})
            .then(async (student)=>{
                if(student != null){
                    const mentor = await Mentor.findOne({name: req.body.mentorName})
                    if (mentor != null){
                        mentor.students.push(student._id)
                        await mentor.save()
                        
                        student.previousMentor = student.currentMentor

                        // Removing student from previous mentor
                        const pMentor =  await Mentor.findById({_id: student.previousMentor})
                        if(pMentor != null){
                            const index = pMentor.students.indexOf(student._id)
                            pMentor.students.splice(index, 1)
                            await pMentor.save()
                        }
                        
                        
                        student.currentMentor = mentor._id
                        await student.save()

                        res.send("Student's Mentor has been changed/assigned")
                    }
                    else{
                        console.log(`${req.body.mentorName} is not a mentor`)
                    }
                }
                else{
                    console.log(`${req.body.studentName} is not a Student`)
                }
            })
            .catch((err)=>{
                console.log(err)
            })
    })


    // 5 Write API to show all students for a particular mentor

    app.get('/getStudentsforMentor',async(req,res)=>{
        await Mentor.findOne({name:req.body.mentorName})
        .then(async (mentor)=>{
            let students = [];
             for(let i=0; i < mentor.students.length; i++){
                const student =  await Student.findById({_id:mentor.students[i]})
                students.push(student)
             }

        res.send(students)
            
        })
    })

    // 6 Write an API to show the previously assigned mentor for a particular student.

    app.get('/getPreviousMentor',async(req,res)=>{
        await Student.findOne({name:req.body.studentName})
        .then(async (student)=>{
            const pMentor =  await Mentor.findById({_id:student.previousMentor})
            res.send(pMentor)
        })
    })


//-----------------------------------------------------------------------------------------\\


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})