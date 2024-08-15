const express = require("express");
const fs = require('node:fs');
const router = express.Router();

router.get("/", (req, res) => {
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const favFood = req.query.favFood;

    // Default in case of undefined values
    if (firstName===undefined || lastName===undefined || favFood===undefined) {
        firstName = lastName = favFood = "Not Given";
    }
    const newContent = firstName + "," + lastName + "," + favFood + ",";

    fs.appendFile("data.txt", newContent, err => {
        if (err) {
            console.error(err);
        }
    })

    res.send(
        "<html><head></head><body>" +
        "<p>Thank you for your submission " + firstName + " " + lastName + ","+
        "<br>Your favorite food is " + favFood + "!</p>" +
        "</body></html>"
    );
});

module.exports = router;