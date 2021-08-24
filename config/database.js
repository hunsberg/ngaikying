const mongoose = require("mongoose");
const { MONGO_URL } = process.env;

exports.connect = () => {
    // connecting to database

    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }).then(()=> {
        console.log("Successfully connect to database");
    }).catch((error) => {
        console.log("database connection failed. exiting now...");
        console.error(error);
        process.exit(1);
    });
};