const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = 3003;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoArticles";

mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", (req, res) => {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(response => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each((i, element) => {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children("a").text();
      result.link = $(element).children("a").attr("href");
      result.Summary = $(element).children("a").attr.text(); 

      // Create a new Article using the `result` object built from scraping
      db.Articles.create(result)
        .then(dbArticle => {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(err => {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", (req, res) => {
  console.log('running')
  // Grab every document in the Articles collection
  db.Articles.findById({
      _id: "5cc1d14c07ea3f54cb60a702"
      // title: "Biden"
    }).then(dbArticle => {
      console.log("This is to find what articles!!!!!" + dbArticle);

      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res) => {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Articles.findOne({
      _id: req.params.id
    })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(dbArticle => {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", (req, res) => {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(dbNote => {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Articles.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(dbArticle => {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
















// // Dependencies
// const express = require("express");
// const mongojs = require("mongojs");
// const axios = require("axios");
// const cheerio = require("cheerio");
// const logger = require("morgan");
// const path = require("path");

// // Initialize Express
// const app = express();

// app.use(logger("dev"));

// // Parse request body as JSON
// app.use(express.urlencoded({
//   extended: true
// }));
// app.use(express.json());
// // Make public a static folder
// app.use(express.static("public"));

// // Database configuration
// const databaseUrl = "scrapenews";
// const collections = ["news"];

// // Hook mongojs config to db variable
// const db = mongojs(databaseUrl, collections);
// db.on("error", error => {
//   console.log("Database Error:", error);
// });

// // Routes
// // ======

// // Simple index route
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname + "./public/index.html"));
// });

// // Handle form submission, save submission to mongo
// app.post("/submit", (req, res) => {
//   console.log(req.body);
//   // Insert the note into the notes collection
//   db.news.insert(req.body, (error, saved) => {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     } else {
//       // Otherwise, send the note back to the browser
//       // This will fire off the success function of the ajax request
//       res.send(saved);
//     }
//   });
// });

// // Retrieve results from mongo
// app.get("/all", (req, res) => {
//   // Find all notes in the notes collection
//   db.news.find({}, (error, found) => {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     } else {
//       // Otherwise, send json of the notes back to user
//       // This will fire off the success function of the ajax request
//       res.json(found);
//     }
//   });
// });

// // Scrape data from one site and place it into the mongodb db
// app.get("/scrape", (req, res) => {
//   // Make a request via axios for the news section of `ycombinator`
//   axios.get("https://news.ycombinator.com/").then(response => {
//     // Load the html body from axios into cheerio
//     const $ = cheerio.load(response.data);
//     // For each element with a "title" class
//     $(".Headline").each((i, element) => {
//       // Save the text and href of each link enclosed in the current element
//       const Headline = $(element).children("a").text();
//       const URL = $(element).children("a").attr("href");

//       // If this found element had both a title and a link
//       if (Headline && Summary && photo && URL) {
//         // Insert the data in the scrapedData db
//         db.news.insert({
//             Headline: Headline,
//             Summary: Summary, 
//             photo: photo, 
//             URL: URL
//           },
//           (err, inserted) => {
//             if (err) {
//               // Log the error if one is encountered during the query
//               console.log(err);
//             } else {
//               // Otherwise, log the inserted data
//               console.log(inserted);
//             }
//           });
//       }
//     });
//   });

//   // Send a "Scrape Complete" message to the browser
//   res.send("Scrape Complete");
// });

// // Select just one note by an id
// app.get("/find/:id", (req, res) => {
//   // When searching by an id, the id needs to be passed in
//   // as (mongojs.ObjectId(IdYouWantToFind))

//   // Find just one result in the notes collection
//   db.news.findOne({
//       // Using the id in the url
//       _id: mongojs.ObjectId(req.params.id)
//     },
//     (error, found) => {
//       // log any errors
//       if (error) {
//         console.log(error);
//         res.send(error);
//       } else {
//         // Otherwise, send the note to the browser
//         // This will fire off the success function of the ajax request
//         console.log(found);
//         res.send(found);
//       }
//     }
//   );
// });

// // Update just one note by an id
// app.post("/update/:id", (req, res) => {
//   // When searching by an id, the id needs to be passed in
//   // as (mongojs.ObjectId(IdYouWantToFind))

//   // Update the note that matches the object id
//   db.news.update({
//       _id: mongojs.ObjectId(req.params.id)
//     }, {
//       // Set the title, note and modified parameters
//       // sent in the req body.
//       $set: {
//         Headline: req.body.title,
//         news: req.body.news,
//         modified: Date.now()
//       }
//     },
//     (error, edited) => {
//       // Log any errors from mongojs
//       if (error) {
//         console.log(error);
//         res.send(error);
//       } else {
//         // Otherwise, send the mongojs response to the browser
//         // This will fire off the success function of the ajax request
//         console.log(edited);
//         res.send(edited);
//       }
//     }
//   );
// });

// // Delete One from the DB
// app.get("/delete/:id", (req, res) => {
//   // Remove a note using the objectID
//   db.news.remove({
//       _id: mongojs.ObjectID(req.params.id)
//     },
//     (error, removed) => {
//       // Log any errors from mongojs
//       if (error) {
//         console.log(error);
//         res.send(error);
//       } else {
//         // Otherwise, send the mongojs response to the browser
//         // This will fire off the success function of the ajax request
//         console.log(removed);
//         res.send(removed);
//       }
//     }
//   );
// });

// // Clear the DB
// app.get("/clearall", (req, res) => {
//   // Remove every note from the notes collection
//   db.news.remove({}, (error, response) => {
//     // Log any errors to the console
//     if (error) {
//       console.log(error);
//       res.send(error);
//     } else {
//       // Otherwise, send the mongojs response to the browser
//       // This will fire off the success function of the ajax request
//       console.log(response);
//       res.send(response);
//     }
//   });
// });

// // Listen on port 3003
// app.listen(3003, () => {
//   console.log("App running on port 3003!");
// });