import { configDotenv } from "dotenv";
import mongoose from "mongoose";

// importing environment varibles
configDotenv();

// main app router
import app from "./app";

// connecting to mongodb server
mongoose
  .connect(`${process.env.DB_CONN_STRING}`)
  .then(() => console.log("db connected successfuly"));

const server = app.listen(process.env.PORT, function () {
  console.log(`server is running on port ${process.env.PORT}`);
});
