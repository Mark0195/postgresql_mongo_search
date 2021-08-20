//require modules and connect to mongodb
const Pool = require('pg').Pool;
const bcrypt = require('bcrypt');
const url = "mongodb://localhost:27017/";
const mongodb = require('mongodb');
const MongoClient = new mongodb.MongoClient(url);

//connect to postgres
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'animals',
    password: 'password',
    port: 5432
});

//sends user info too postgres to see if user exist, if not account made
const sentInfo = async (req, res) => {
    const email = req.body.email.toString();
    const pass = req.body.password.toString();
    const en_pass = await bcrypt.hash(pass, 10);
    let results = await pool.query('SELECT * FROM passwordtable WHERE email=$1', [email])
    if (results.rows.length > 0) {
        res.send('Error!! This email already exist on this website!!!');
    } else {
        pool.query(`INSERT INTO passwordtable (email, password) VALUES ($1, $2)`, [email, en_pass]);
        res.redirect('/search')
    }
};

//checks postgres to see if user exist and lets password work thru bcrypt
const signIn = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let results = await pool.query('SELECT * FROM passwordtable WHERE email=$1', [email])
    if (results.rows < 1) {
        res.send('This account does not exist!!!')
    } else if (results.rows > 1) {
        console.warn("Two accounts with same email!!!")
        res.send("Detected two accounts with this email, oh no!!")
    } else {
        let password_match = await bcrypt.compare(password, results.rows[0].password);
        if (password_match) {
            req.session.email = email;
            req.session.loggedIn = true;
            res.redirect('/search')
        } else {
            res.send("Password wrong!!!! Try again Partner!!")
        }
    }
};

//checks the search page to see if user is logged on, if not it sends message
const checkUserLoggedIn = async (req, res, next) => {
    if (req.session.loggedIn === true) {
        next()
    } else {
        res.send("Please log in")
    }
};

// searches thru postgres for inputed value, then sends results to page and the search value into table
const searchPost = async (req, res) => {
    const email = req.session.email
    const searched = req.body.search
    let results = await pool.query(`SELECT * FROM mock_data WHERE animals LIKE '%${searched}%' OR common_name LIKE '%${searched}%'`)
    pool.query(`INSERT INTO searchtable (email, searched) VALUES ($1, $2)`, [email, searched]);
    return results.rows
};
// searches thru mongodb for inputed value, then sends results to page and the search value into table
const searchMongo = async (req, res) => {
    const email = req.session.email
    const searched = req.body.search
    const mongo_results_promise = MongoClient.connect().then(async function (db, err) {
        if (err) throw err;
        let dbo = db.db("sprint")
        let results = await dbo.collection('animal').find({ $or: [ {animals : new RegExp(`${searched}`)}, {common_name : new RegExp(`${searched}`)}]}).toArray()
        if (err) throw err;
        await db.close();
        pool.query(`INSERT INTO searchtable (email, searched) VALUES ($1, $2)`, [email, searched]);
        console.log(results);
        return results
    }).catch((err)=>{
        console.error(err.stack);
        console.error(err);
    });
    return mongo_results_promise;
}

// logs user out
const logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = {
    logOut,
    signIn,
    sentInfo,
    searchPost,
    searchMongo,
    checkUserLoggedIn
}