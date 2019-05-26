// DEPENDENCIES
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Require axios and cheerio, makes scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Set handlebars
var exphbs = require('express-handlebars');

app.engine("handlebars", exphbs({ defaultLayout: "main" } ));
app.set("view engine", "handlebars");

// Connect to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);


// ROUTES

// Scrape route
app.get("/scrape", function(req, res) {
    axios.get("https://www.theonion.com/c/news-in-brief").then(function(response) {
        
        var $ = cheerio.load(response.data);
        var result = {};

        $("article.js_post_item").each(function(i, element) {

            result.title = $(element).find("h1").text();
            result.link = $(element).find("figure").find("a").attr("href");
            result.saved = false;
            result.buttonTxt = "Save Article";

            // Create a new Article using the `articles` object built from scraping
            db.Article.create(result)
            .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
            .catch(function(err) {
                // If an error other then Duplicate Entry occurred, log it
                if (!err.errmsg.match(/E11000.*/)){
                    console.log(err);
                }
            });
        });

    })
    res.redirect('/articles');
});

// Get all unsaved articles
app.get("/", function(req, res) {
    db.Article.find({"saved": false}, function(err, articles){
        console.log(articles);
        res.render("index", {articles:articles});
    });
});

// Get all saved articles
app.get("/articles", function(req, res) {
    db.Article.find({"saved": true}, function(err, articles){
        res.render("index", {articles:articles});
    });
});

// Get article by id
app.get("/articles/:id", function(req, res) {
    db.Article.find({_id: req.params.id}, function(err, article){
        res.render("index", {articles: article})
    })
    
});

// Get article by id and update to saved
app.put("/articles/:id", function(req, res) {
    db.Article.findByIdAndUpdate(
        req.params.id,
        {saved: req.body.saved, buttonTxt: req.body.buttonTxt},
        {new: true},
        (err, article) => {
            if (err) return res.status(500).send(err);
            return res.send(article);
        }
    )
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
