import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const wipeDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const collections = Object.keys(mongoose.connection.collections);

    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
      console.log(`Cleared collection: ${collectionName}`);
    }

    console.log("Database wiped successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error wiping database:", err);
    process.exit(1);
  }
};

wipeDatabase();