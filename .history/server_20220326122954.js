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

app.get("/auth_config.json", (req, res) =>{ 
    res.sendFile(join(__dirname, "/auth_config.json"));
})

mongoose.connect("mongodb://localhost:27017/teamMembersDB", {useNewUrlParser: true});

const membersSchema = new mongoose.Schema({
  name: String,
  role: String,
  age: Number,
  progress: []
});

let members = [];

const Member =  mongoose.model("Member", membersSchema);

const memberOne = new Member({
    name : "Noah Allen", 
    role: "center" 

})


app.get("/", (req, res)=>{
    members.push(memberOne)
    Member.find({}, function(err, foundMembers){

        if (foundMembers.length === 0) {
          Member.insertMany(members, function(err){
            if (err) {
              console.log(err);
            } else {
              console.log("Successfully savevd members to DB.");
            }
          });
          res.redirect("/");
        } else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
      });
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});