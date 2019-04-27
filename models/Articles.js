//Require mongoose
const mongoose = require("mongoose");

//Create Schema class
const Schema = mongoose.Schema;

//Article Schema
const ArticlesSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  Summary: { 
    type:String, 
    required:true
  }, 
  //Save Notes array
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// This Article model
const Articles = mongoose.model("Articles", ArticlesSchema);

// Export the Article model
module.exports = Articles;