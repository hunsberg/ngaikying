require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json({ limit: "50mb" }));

//importing user context
const User = require("./model/user");
const auth = require("./middleware/auth");


app.use("/app", (req, res) => {
    res.status(201).json({
        Login_ID: "case insensitive",
        Password: "password",
    });
});

// Register
app.post("/register", async (req, res) => {
    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // validate user input
        if(!(email && password && first_name && last_name)){
            return res.status(400).send("All input is requred, must be 4 inputs.");
        }

        // check if user already exist
        const oldUser = await User.findOne({ email });
        if(oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
 
        // encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
        // create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        return res.status(201).json(user);
    } catch ( err ){
        console.log(err);
    }
});

/* Part 1: */
app.post("/login", async (req, res) => {
    try{
        // get user input
        const { email, password } = req.body;
        // validate user input
        if(!(email && password)){
            return res.status(400).send("All input is required");
        }
        //validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // create token
            const token = jwt.sign( { user_id: user._id, email }, process.env.TOKEN_KEY, { expiresIn: "2h", } );
            // save user token
            user.usertoken.token.accessToken = token;
            // user
            return res.status(200).json(user.usertoken);
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});


app.get("/welcome", auth, (req, res) => {
    return res.status(200).send("Hello World");
});


/* Part 2: Design a new API to allow the client to securely and automatically regenerate a new token.*/
// generate or renew token
app.post("/renew", async (req, res) => {
    try{
        // get user input
        const { email, password } = req.body;

        // validate user input
        if(!(email && password)){
            return res.status(400).send("All input is required");
        }

        //validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // create token
            const token = jwt.sign( { user_id: user._id, email }, process.env.TOKEN_KEY, { expiresIn: "2h", } );

            user.usertoken.token.accessToken = token;
            // user
            return res.status(200).json("new token: "+user.usertoken.token.accessToken);
        }
        return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});

app.use("*", (req, res) => {
    res.status(404).json({
        success: "false",
        message: "Page not found",
        error: {
            statusCode: 404,
            message: "You reached a route that is not defined on this server",
        },
    });
});

module.exports = app;

