const mongoose = require("mongoose");


const NotesSchema = new mongoose.Schema({
  SubjectName: {
    type: String,
    required: true,
},
  Modules: {
    type: Array,
    required: true,
},
  Sem:  {
    type: String,
    required: true,
},
  SubjectNumber:  {
    type: String,
    required: true,
},
  PYQLink: {
    type: String,
    required: true,
},

  State: {
    type: Number,
    required: true,
},
  CIE1:  {
    type: String,
    required: true,
},

  CIE2:  {
    type: String,
    required: true,
},
  CIE3:  {
    type: String,
    required: true,
},

});


const Notes = mongoose.model("Notes", NotesSchema);

module.exports = Notes;
