const db = require('./database');

//shows postgres results on page
const postLanding = async (req, res) => {
    let post = await db.searchPost(req, res)
    res.render('search.html', {
        postgres : post,
        postgresList : true
    });  
}

//shows mongodb results on page
const mongoLanding = async (req, res) => {
    let mongo = await db.searchMongo(req, res)
    res.render('search.html', {
        mongodb : mongo,
        mongoList : true
    })  
}

//shows both results on page
const bothLanding = async (req, res) => {
    let post = await db.searchPost(req, res)
    let mongo = await db.searchMongo(req, res)
    res.render('search.html', {
        postgres : post,
        mongodb : mongo,
        bothList : true
    })  
}
module.exports = {
    postLanding,
    mongoLanding,
    bothLanding
}