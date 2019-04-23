// Loads results onto the page
function getResults() {
  // Empty any results currently on the page
  $("#results").empty();

  $.getJSON("/all", (data) => {
    for (let i = 0; i < data.length; i++) {
      $("#results").prepend("<p class='data-entry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" +
        data[i]._id + ">" + data[i].Headline + data[i].Summary + data[id].URL + data[id].photo + "</span><span class=delete>X</span></p>");
    }
  });
}

// Runs the getResults function as soon as the script is executed
getResults();

// When the #make-new button is clicked
$(document).on("click", "#make-new", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/submit",
    data: {
      title: $("#title").val(),
      note: $("#note").val(),
      created: Date.now()
    }
  })
  // If that API call succeeds, add the title and a delete button for the note to the page
    .then((data) => {
    // Add the title and delete button to the #results section
      $("#results").prepend("<p class='data-entry' data-id=" + data._id + "><span class='dataTitle' data-id=" +
      data._id + ">" + data.Headline + "</span><span class=delete>X</span></p>");
      // Clear the note and title inputs on the page
      $("#Summary").val("");
      $("#URL").val("");
      $("#photo").val(""); 
    });
});

// When the #clear-all button is pressed
$("#clear-all").on("click", function() {
  // Make an AJAX GET request to delete the notes from the db
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/clearall",
    // On a successful call, clear the #results section
    success: (response) => {
      $("#results").empty();
    }
  });
});

// When user clicks the delete button for a note
$(document).on("click", ".delete", function() {
  // Save the p tag that encloses the button
  let selected = $(this).parent();
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/delete/" + selected.attr("data-id"),

    // On successful call
    success: (response) => {
      // Remove the p-tag from the DOM
      selected.remove();
      // Clear the note and title inputs
      $("#Headline").val("");
      $("#Summary").val("");
      $("#URL").val(""); 
      $("#photo").val(""); 
      // Make sure the #action-button is submit (in case it's update)
      $("#action-button").html("<button id='make-new'>Submit</button>");
    }
  });
});

// When user click's on note title, show the note, and allow for updates
$(document).on("click", ".dataTitle", function() {
  // Grab the element
  let selected = $(this);
  // Make an ajax call to find the note
  // This uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/find/" + selected.attr("data-id"),
    success: (data) => {
      // Fill the inputs with the data that the ajax call collected
      $("#Headline").val(data.Headline);
      $("#Summary").val(data.Summary);
      // Make the #action-button an update button, so user can
      // Update the note s/he chooses
      $("#action-button").html("<button id='updater' data-id='" + data._id + "'>Update</button>");
    }
  });
});

// When user click's update button, update the specific note
$(document).on("click", "#updater", function() {
  // Save the selected element
  let selected = $(this);
  // Make an AJAX POST request
  // This uses the data-id of the update button,
  // which is linked to the specific note title
  // that the user clicked before
  $.ajax({
    type: "POST",
    url: "/update/" + selected.attr("data-id"),
    dataType: "json",
    data: {
      Headline: $("#Headline").val(),
      Summary: $("#Summary").val()
    },
    // On successful call
    success: (data) => {
      // Clear the inputs
      $("#Headline").val("");
      $("#Summary").val("");
      // Revert action button to submit
      $("#action-button").html("<button id='make-new'>Submit</button>");
      // Grab the results from the db again, to populate the DOM
      getResults();
    }
  });
});