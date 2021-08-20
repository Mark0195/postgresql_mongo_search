//all modules required thru project and port name
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');
const nunjucks = require('nunjucks');
const nun = require('./pull');
const theport = 4206

const app = express();

nunjucks.configure('', {
    express: app
});

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(session({secret:"SnoopDogg"}))

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, 'signin.html'))
})
// app post for login
app.post("/signin", db.signIn);

app.get("/signup", function(req, res){
    res.sendFile(path.join(__dirname, 'signup.html'))
})
// app post for signing up to site
app.post("/signup", db.sentInfo);

//app post to check if user is signed in and then allows to search thru databases to find animals
app.post("/search", db.checkUserLoggedIn, (req, res)=>{
    const database = req.body.database.toLowerCase()
    if (database === "postgres"){
        nun.postLanding(req, res)
    }else if(database === "mongodb"){
        nun.mongoLanding(req, res)
    }else if(database === "both"){
        nun.bothLanding(req, res)
    }
});

app.get("/search", db.checkUserLoggedIn, (req, res)=>{
    res.render('search.html')
});

app.get("/logout", function(req, res){
    res.render('logout.html')
})

// app post for user to log out
app.post('/logout', db.logOut);

//port so you can run program
app.listen(theport, () => {
    console.log(`Listened at http://localhost:${theport}`)
})