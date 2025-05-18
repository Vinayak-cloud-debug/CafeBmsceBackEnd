// const mongodb=require('mongodb')

// const connectionUrl="mongodb://127.0.0.1:27017/Restaurant" // 0.0.0.0:27017/name_of_collection //

// const client=new mongodb.MongoClient(connectionUrl)

// var db;

// try{
    
//     client.connect();
//     console.log("Connected to Mongodb")
//     db=client.db()
// }

// catch(err)
// {
//     console.log(err)
// }

// module.exports=db

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
