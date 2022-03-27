//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { join } = require("path");
require("dotenv").config();
const app = express();

// TWILIO STUFF

const accountSID = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = require('twilio')(accountSID, authToken);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/auth_config.json", (req, res) => {
    res.sendFile(join(__dirname, "/auth_config.json"));
})

// for each team member
mongoose.connect("mongodb://localhost:27017/teamMembersDB", { useNewUrlParser: true });

const membersSchema = new mongoose.Schema({
    name: String,
    role: String,
    age: Number,
    email: String,
    phone: String,
    progress: []
});

let members = [];

const Member = mongoose.model("Member", membersSchema);

// to identify teams 
const teamSchema = new mongoose.Schema({
    coachName: String,
    team: [{ name: String }, { sport: String }]
})

const Team = mongoose.model("Team", teamSchema);

// When no members are present 
const noMember = new Member({
    name: "No members yet"
})


// get requests

app.get("/signup", (req, res) => {
    res.render("signup/signup")
})
let person = "";
app.get("/coach", (req, res) => {
    person = "Coach"
    res.render("signup/coach");
})

app.get("/player", (req, res) => {
    person = "Team Member"
    res.render("signup/player")
})

app.get("/", (req, res) => {
    Member.find({}, function (err, foundMembers) {

        if (foundMembers.length === 0) {
            members.push(noMember)
            Member.insertMany(members, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved members to DB.");
                }
            });
            // res.redirect("/");
        } else {
            Member.deleteOne({ "name": "No members yet" }, (err, person) => {
                if (err) return handleError(err);
            })
            res.render('index', { allMembers: foundMembers, person: person })
        }
    });
})

app.get("/:personName", function (req, res) {
    const personName = _.capitalize(req.params.personName);
    let person;
    Member.findById(personName, (err, person) => {
        person = person;
    })
    res.send(person);
    // res.render("account", { personName: personName });
});


// post requests

app.post("/", (req, res) => {

    const playerName = req.body.newPlayer;
    const role = req.body.newRole;
    const listName = req.body.list;
    const player = new Member({
        name: playerName,
        role: role
    })
    player.save();
    res.redirect("/")
})

app.post("/delete", function (req, res) {
    const removedPlayer = req.body.checkbox;

    Member.findByIdAndRemove(removedPlayer, function (err) {
        if (!err) {
            console.log("Successfully deleted player.");
            res.redirect("/");
        } else { console.log(err) }
    });

})

app.post("/coach", (req, res) => {
    const coachName = req.body.coachName;
    const teamName = req.body.teamName;
    const sportType = req.body.sportType;
    teams = new Team({
        coachName: coachName,
        team: [{ name: teamName, sport: sportType }]
    })
    res.redirect("/")
})

app.post("/announcements", (req, res) => {
    const message = req.body.message;
    members.forEach(member => {
        client.messages.create({
            to: member.phone,
            from: process.env.TWILIO_PHONE_NUMBER, //is this going to be dynamic?
            body: message
        })
            .then((message) => {
                console.log(message.sid)
                res.redirect("/")
            });
    })
})

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
