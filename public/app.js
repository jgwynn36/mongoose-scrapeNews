// Grab the articles as a json
$.getJSON("/articles", data => {
  // For each one
  for (let i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

$("#scrape").on("click", function (e) {
  e.preventDefault();
  $.getJSON("/scrape", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  const thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
    .then(data => {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(data => {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});





// // Loads results onto the page
// function getResults() {
//   // Empty any results currently on the page
//   $("#results").empty();

//   $.getJSON("/all", (data) => {
//     for (let i = 0; i < data.length; i++) {
//       let Headline = data[i].Headline;
//       let Summary = data[i].Summary;
//       let url = data[i].URL;
//       let photo = data[i].photo;

//       $("#results").append("<class='data-entry' data-id=" + data[i]._id + ">" + "<h3> <a class='dataHeadline'>" + Headline + " " + url + "</h3>" + "</a>" + "<h5 class='dataSummary'>" + Summary + "</h5 > " + " < span class = 'dataPhoto' > " + photo + " < /span>" + "</span > < span class = delete > X < /span>");
//     }
//   });
// }

// // Runs the getResults function as soon as the script is executed
// getResults();

// // When the #make-new button is clicked
// $(document).on("click", "#make-new", function () {
//   // AJAX POST call to the submit route on the server
//   // This will take the data from the form and send it to the server
//   $.ajax({
//       type: "POST",
//       dataType: "json",
//       url: "/submit",
//       data: {
//         title: $("#title").val(),
//         note: $("#note").val(),
//         created: Date.now()
//       }
//     })
//     // If that API call succeeds, add the title and a delete button for the note to the page
//     .then((data) => {
//       // Add the title and delete button to the #results section
//       $("#results").prepend("<p class='data-entry' data-id=" + data._id + "><span class='dataTitle' data-id=" +
//         data._id + ">" + data.Headline + "</span><span class=delete>X</span></p>");
//       // Clear the note and title inputs on the page
//       $("#Summary").val("");
//       $("#URL").val("");
//       $("#photo").val("");
//     });
// });

// // When the #clear-all button is pressed
// $("#clear-all").on("click", function () {
//   // Make an AJAX GET request to delete the notes from the db
//   $.ajax({
//     type: "GET",
//     dataType: "json",
//     url: "/clearall",
//     // On a successful call, clear the #results section
//     success: (response) => {
//       $("#results").empty();
//     }
//   });
// });

// // When user clicks the delete button for a note
// $(document).on("click", ".delete", function () {
//   // Save the p tag that encloses the button
//   let selected = $(this).parent();
//   // Make an AJAX GET request to delete the specific note
//   // this uses the data-id of the p-tag, which is linked to the specific note
//   $.ajax({
//     type: "GET",
//     url: "/delete/" + selected.attr("data-id"),

//     // On successful call
//     success: (response) => {
//       // Remove the p-tag from the DOM
//       selected.remove();
//       // Clear the note and title inputs
//       $("#Headline").val("");
//       $("#Summary").val("");
//       $("#URL").val("");
//       $("#photo").val("");
//       // Make sure the #action-button is submit (in case it's update)
//       $("#action-button").html("<button id='make-new'>Submit</button>");
//     }
//   });
// });

// // When user click's on note title, show the note, and allow for updates
// $(document).on("click", ".dataTitle", function () {
//   // Grab the element
//   let selected = $(this);
//   // Make an ajax call to find the note
//   // This uses the data-id of the p-tag, which is linked to the specific note
//   $.ajax({
//     type: "GET",
//     url: "/find/" + selected.attr("data-id"),
//     success: (data) => {
//       // Fill the inputs with the data that the ajax call collected
//       $("#Headline").val(data.Headline);
//       $("#Summary").val(data.Summary);
//       // Make the #action-button an update button, so user can
//       // Update the note s/he chooses
//       $("#action-button").html("<button id='updater' data-id='" + data._id + "'>Update</button>");
//     }
//   });
// });

// // When user click's update button, update the specific note
// $(document).on("click", "#updater", function () {
//   // Save the selected element
//   let selected = $(this);
//   // Make an AJAX POST request
//   // This uses the data-id of the update button,
//   // which is linked to the specific note title
//   // that the user clicked before
//   $.ajax({
//     type: "POST",
//     url: "/update/" + selected.attr("data-id"),
//     dataType: "json",
//     data: {
//       Headline: $("#Headline").val(),
//       Summary: $("#Summary").val()
//     },
//     // On successful call
//     success: (data) => {
//       // Clear the inputs
//       $("#Headline").val("");
//       $("#Summary").val("");
//       // Revert action button to submit
//       $("#action-button").html("<button id='make-new'>Submit</button>");
//       // Grab the results from the db again, to populate the DOM
//       getResults();
//     }
//   });
// });