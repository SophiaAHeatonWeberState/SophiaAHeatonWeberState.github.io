const express = require("express");
const userRoute = require("./routes/user");
const listRoute = require("./routes/list");
const foodRoute = require("./routes/food");


const app = express();                      // Loading express
const port = 3000;                          // Port Number
app.use("/user_route", userRoute);          // User Route
app.use("/list_route", listRoute);          // List Route
app.use("/food_route", foodRoute);         // List Route


// Showing route in form.js
app.get("/", (req, res) => {
    res.send(
        "<h1>Node/Express Site With File Storage</h1>" +
        "<h2>Sophia Heaton - 5/18/2024<h2"
    );
});

app.use(express.static("public"));

app.listen(port, () => {
    console.log("Server started on port: " + port);
})