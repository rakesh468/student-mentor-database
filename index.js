import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); //dotenv configiration//

// express on app //
const app = express();

app.use(cors())

//middleware to convert all request into json format//
app.use(express.json());

//app running in port//
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL; //MongoDB URL//

//MongoDB Connection//
async function connection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("MongoDB connected");
  return client;
}
const client = await connection();

//welcome page of server//
app.get("/", (request, response) => {
  response.send("Hello world");
});

//get all mentors using get method//
app.get("/mentors", async (request, response) => {
  const data = await client.db("JGVV").collection("mentor").find().toArray();
  response.send(data);
});

//get all students using get method//
app.get("/students", async (request, response) => {
  const data = await client.db("JGVV").collection("students").find().toArray();
  response.send(data);
});
//getting a mentor filter by name using get method//
app.get("/mentor", async (request, response) => {
  const { mentor_name } = request.query;
  const result = await client
    .db("JGVV")
    .collection("mentor")
    .findOne({ mentor_name: mentor_name });
  response.send(result);
});

// creating student using post method//
let students = [];

app.post("/create_student", async (request, response) => {
  let student = {};
  
  if (request.body.student_name) {
    student.student_name = request.body.student_name;
  } else {
    response.status(401).response({ message: "Student Name Required" });
  }
  if (request.body.student_email) {
    student.student_email = request.body.student_email;
  } else {
    response.status(401).response({ message: "Student Email Required" });
  }
  if (request.body.student_DOB) {
    student.student_DOB= request.body.student_DOB;
  } else {
    response.status(401).send({ message: "DOB Required" });
  }
  if(request.body.course){
    student.course=request.body.course;
  }else{
    response.status(401).send({message:"Course Required"})
  }if(request.body.mentorassigned){
    student.mentorassigned=request.body.mentorassigned
  }else{
    response.status(401).send({message:"Mentor required"})
  }

  students.push(student); //push method to push students object data inside array//
  await client.db("JGVV").collection("students").insertOne(student);
  student
    ? response.status(200).send({ message: "Student Created" })
    : response.status(401).send({ message: "Required Details" });
});

//Asign students to mentor//
app.put("/assign-student", async (request, response) => {
  const { mentor_name, studentsassigned } = request.body;
  const mentors = await client
    .db("JGVV")
    .collection("mentor")
    .updateOne(
      { mentor_name: mentor_name },
      { $set: { studentsassigned: studentsassigned } }
    );
  const studentname = studentsassigned.map((urs) => {
    console.log(studentname);
    const student = client
      .db("JGVV")
      .collection("students")
      .updateOne(
        { student_name: urs },
        { $set: { mentorassigned: mentor_name } }
      );
    console.log(student);
  });
  response.send({ message: "Data Updated" });
});

// creating mentor using post method //
let mentors = [];

app.post("/create_mentor", async (request, response) => {
  let mentor = {};
  if (request.body.mentor_name) {
    mentor.mentor_name = request.body.mentor_name;
  } else {
    response.status(400).send({ message: "Mentor Name Required" });
  }
  if (request.body.mentor_email) {
    mentor.mentor_email = request.body.mentor_email;
  } else {
    response.status(400).send({ message: " Mentor Email Required" });
  }
  if(request.body.contact_no){
    mentor.contact_no=request.body.contact_no
  }else{
    response.status(401).send({message:"Contact no Required"})
  }

  //push method to push mentors object data inside array//
  mentors.push(mentor);
  await client.db("JGVV").collection("mentor").insertOne(mentor);
  mentors
    ? response.status(200).send({ message: "Mentor Created" })
    : response.status(400).send({ message: "Details Required" });
  console.log(mentors);
});

// assign mentor to particular student //
app.put("/assign-mentor", async (request, response) => {
  const { student_name, mentorassigned } = request.body;
  const mentor = await client
    .db("JGVV")
    .collection("students")
    .updateOne(
      { student_name: student_name },
      { $set: { mentorassigned: mentorassigned } }
    );
  const student = await client
    .db("JGVV")
    .collection("mentor")
    .findOneAndUpdate(
      { mentor_name: mentorassigned },
      { $addToSet: { studentsassigned: student_name } }
    );
  response.send({ message: "Data Updated" });
});

app.listen(PORT, () => console.log("App Running in", PORT));
