const express = require("express");
const fs = require('node:fs');
const router = express.Router();

router.get("/", (req, res) => {
    fs.readFile("data.txt", "utf8", (err, content) => {
        if (err) {
            console.error(err);
        }

        let splitedContent = content.split(",");
        let htmlCode = "<html><head></head><body><p>Users who share the same Favorite Food:<br>";
        let tempCode = "";
        for (let i = 0; i < splitedContent.length-1; i+=3) {
            if (splitedContent[i+2] == req.query.favFoodSearch) {
                tempCode += splitedContent[i] + " " + splitedContent[i+1] + "<br>";
            }
        }
        if (tempCode == "") {
            tempCode = "No Users share that food choice"
        }
        htmlCode += tempCode + "</p></body></html>";

        res.send(
            htmlCode
        );
    });
});

module.exports = router;