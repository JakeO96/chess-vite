import mongoose from 'mongoose';

export const connectDb = async () => {
  const dbConnectionString = process.env.DB_CONNECTION_STRING;
  if (dbConnectionString){
    try {
      await mongoose.connect(dbConnectionString);
      console.log("MongoDB connection SUCCESS");
    } catch (error: any) {
      console.error(`MongoDB connection ERROR: ${error.message}`);
      process.exit(1);
    }
  }
};