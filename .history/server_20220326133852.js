//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { join } = require("path");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/auth_config.json", (req, res) => {
    res.sendFile(join(__dirname, "/auth_config.json"));
})

mongoose.connect("mongodb://localhost:27017/teamMembersDB", { useNewUrlParser: true });

const membersSchema = new mongoose.Schema({
    name: String,
    role: String,
    age: Number,
    email: String,
    progress: []
});

let members = [];

const Member = mongoose.model("Member", membersSchema);

const memberOne = new Member({
    name: "Noah Allen",
    role: "center"

})


app.get("/", (req, res) => {
    Member.find({}, function (err, foundMembers) {

        if (foundMembers.length === 0) {
            // members.push(memberOne)
            Member.insertMany(members, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved members to DB.");
                }
            });
            res.redirect("/");
        } else {

            res.render('index', { allMembers: foundMembers })
        }
    });
})

app.get("/signup", (req, res)=>{

    res.render("signup/signup")
})

app.get("/coach", (req, res)=>{
    res.render("signup/coach");
})

app.get("/player", (req, res)=>)


app.post("/", (req, res) => {

    const playerName = req.body.newPlayer;
    const listName = req.body.list;
    const player = new Member({
        name: playerName
    })
    player.save();
    res.redirect("/")
})

app.post("/delete", function (req, res){
    const removedPlayer = req.body.remove;
    Member.findByIdAndRemove(removedPlayer, function(err){
        if (!err) {
          console.log("Successfully deleted player.");
          res.redirect("/");
        }else{console.log(err)}
      });
})

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
