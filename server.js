// Dependencies
const express = require("express");
const mongojs = require("mongojs");
const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("morgan");
const path = require("path");

// Initialize Express
const app = express();

app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Database configuration
const databaseUrl = "scrapenews";
const collections = ["news"];

// Hook mongojs config to db variable
const db = mongojs(databaseUrl, collections);
db.on("error", error => {
  console.log("Database Error:", error);
});

// Routes
// ======

// Simple index route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "./public/index.html"));
});

// Handle form submission, save submission to mongo
app.post("/submit", (req, res) => {
  console.log(req.body);
  // Insert the note into the notes collection
  db.news.insert(req.body, (error, saved) => {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      // Otherwise, send the note back to the browser
      // This will fire off the success function of the ajax request
      res.send(saved);
    }
  });
});

// Retrieve results from mongo
app.get("/all", (req, res) => {
  // Find all notes in the notes collection
  db.news.find({}, (error, found) => {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      // Otherwise, send json of the notes back to user
      // This will fire off the success function of the ajax request
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", (req, res) => {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.ycombinator.com/").then(response => {
    // Load the html body from axios into cheerio
    const $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".Headline").each((i, element) => {
      // Save the text and href of each link enclosed in the current element
      const Headline = $(element).children("a").text();
      const URL = $(element).children("a").attr("href");

      // If this found element had both a title and a link
      if (Headline && Summary && photo && URL) {
        // Insert the data in the scrapedData db
        db.news.insert({
            Headline: Headline,
            Summary: Summary, 
            photo: photo, 
            URL: URL
          },
          (err, inserted) => {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            } else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

// Select just one note by an id
app.get("/find/:id", (req, res) => {
  // When searching by an id, the id needs to be passed in
  // as (mongojs.ObjectId(IdYouWantToFind))

  // Find just one result in the notes collection
  db.news.findOne({
      // Using the id in the url
      _id: mongojs.ObjectId(req.params.id)
    },
    (error, found) => {
      // log any errors
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Otherwise, send the note to the browser
        // This will fire off the success function of the ajax request
        console.log(found);
        res.send(found);
      }
    }
  );
});

// Update just one note by an id
app.post("/update/:id", (req, res) => {
  // When searching by an id, the id needs to be passed in
  // as (mongojs.ObjectId(IdYouWantToFind))

  // Update the note that matches the object id
  db.news.update({
      _id: mongojs.ObjectId(req.params.id)
    }, {
      // Set the title, note and modified parameters
      // sent in the req body.
      $set: {
        Headline: req.body.title,
        news: req.body.news,
        modified: Date.now()
      }
    },
    (error, edited) => {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(edited);
        res.send(edited);
      }
    }
  );
});

// Delete One from the DB
app.get("/delete/:id", (req, res) => {
  // Remove a note using the objectID
  db.news.remove({
      _id: mongojs.ObjectID(req.params.id)
    },
    (error, removed) => {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
      }
    }
  );
});

// Clear the DB
app.get("/clearall", (req, res) => {
  // Remove every note from the notes collection
  db.news.remove({}, (error, response) => {
    // Log any errors to the console
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      // Otherwise, send the mongojs response to the browser
      // This will fire off the success function of the ajax request
      console.log(response);
      res.send(response);
    }
  });
});

// Listen on port 3003
app.listen(3003, () => {
  console.log("App running on port 3003!");
});