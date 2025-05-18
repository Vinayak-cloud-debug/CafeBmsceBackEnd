
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Unique video ID
  link: { type: String, required: true }, // Video URL or file path
  title: { type: String }, // Optional: Video title
  description: { type: String }, // Optional: Description
  uploadedAt: { type: Date, default: Date.now } // Timestamp
},{ collection: "samplevideos" });

const Video = mongoose.model("Video", VideoSchema);


module.exports = Video;
