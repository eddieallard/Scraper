// DEPENDENCIES UNDER THIS LINE
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var Note = require("./models/note.js");
var Article = require("./models/article.js");


// SCRAPING TOOLS UNDER THIS LINE
var request = require("request");
var cheerio = require("cheerio");

// INITIALIZE EXPRESS UNDER THIS LINE
var app = express();
var PORT = process.env.PORT || 3000;

// USE THE BODY PARSER
app.use(bodyParser.urlencoded({
  extended: false
}));

// METHOD OVERRIDE UNDER THIS LINE
app.use(methodOverride('_method'));

// CREATE A PUBLIC STATIC FOLDER
app.use(express.static("./public"));

// HANDLEBARS UNDER THIS LINE
var exphbs = require("express-handlebars");
app.set('views', __dirname + '/views');
app.engine("handlebars", exphbs({
  defaultLayout: "main",
  layoutsDir: __dirname + "/views/layouts"
}));
app.set("view engine", "handlebars");

// CONNECT TO MONGO WITH MONGOOSE
// IF DEPLOYED USE DELAYED DATABASE, ELSE USE THE LOCAL MONGOHEADLINES DB
mongoose.Promise = Promise;
var databaseUri = "mongodb://localhost/mongo-scraper";
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri);
}
var db = mongoose.connection;

db.on("error", error => {
  console.log("Mongoose Error: ", error);
});

db.once("open", () => {
  console.log("Mongoose connection successful.");
});

// EXPRESS ROUTES UNDER THIS LINE
app.get("/", (req, res) => {
  Article.find({})
    .exec(function (error, data) {
      if (error) {
        res.send(error);
      } else {
        var newsObj = {
          Article: data
        };
        res.render("index", newsObj);
      }
    });
});

// A GET TO SCRAPE THE WEBSITE
app.get("/scrape", (req, res) => {

  request("https://www.vice.com/en_us/topic/the-noisey-guide-to", function (error, response, html) {

    var $ = cheerio.load(html);
    $("div.topics-card__content-text").each(function (i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      var entry = new Article(result);

      entry.save((err, doc) => {

        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });

    });
    res.redirect("/");
    console.log("Successfully Scraped");
  });
});

app.post("/notes/:id", (req, res) => {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    } else {
      console.log("this is the DOC " + doc);
      Article.findOneAndUpdate({
        "_id": req.params.id
      }, {
        $push: {
          "note": doc._id
        }
      }, {
        new: true
      }, function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log("note saved: " + doc);
          res.redirect("/notes/" + req.params.id);
        }
      });
    }
  });
});

app.get("/notes/:id", (req, res) => {
  console.log("This is the req.params: " + req.params.id);
  Article.find({
      "_id": req.params.id
    }).populate("note")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      } else {
        var notesObj = {
          Article: doc
        };
        console.log(notesObj);
        res.render("notes", notesObj);
      }
    });
});

app.get("/delete/:id", (req, res) => {
  Note.remove({
    "_id": req.params.id
  }).exec(function (error, doc) {
    if (error) {
      console.log(error);
    } else {
      console.log("note deleted");
      res.redirect("/");
    }
  });
});

// START THE SERVER UNDER THIS LINE
app.listen(PORT, () => {
  console.log("App running on PORT" + PORT + "!");
});