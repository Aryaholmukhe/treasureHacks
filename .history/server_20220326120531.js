//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { join } = require("path");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("")

mongoose.connect("mongodb://localhost:27017/teamMembersDB", {useNewUrlParser: true});

const membersSchema = new mongoose.Schema({
  name: String,
  role: String,
  age: Number,
  progress: []
});


const Member =  mongoose.model("Member", membersSchema);

const memberOne = new Member({
    name : "Noah Allen", 
    role: "center", 

})

app.get("/", (req, res)=>{
    res.render('index')
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
