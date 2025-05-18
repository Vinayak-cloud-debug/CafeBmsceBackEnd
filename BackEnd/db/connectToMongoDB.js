const mongoose = require("mongoose");

const connectToMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI, {
		});
		console.log("✅ Connected to MongoDB");
	} catch (error) {
		console.error("❌ Error connecting to MongoDB:", error.message);
		process.exit(1); // Exit the process if the database connection fails
	}
};

module.exports = connectToMongoDB;
