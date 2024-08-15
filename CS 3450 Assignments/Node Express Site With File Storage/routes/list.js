const express = require("express");
const fs = require('node:fs');
const router = express.Router();

router.get("/", (req, res) => {
    fs.readFile("data.txt", "utf8", (err, content) => {
        if (err) {
            console.error(err);
        }

        let splitedContent = content.split(",");
        let userNum = 1;
        let htmlCode = "<html><head></head><body><table><th></th><th>First Name</th><th>Last Name</th><th>Favorite Food</th>";
        for (let i = 0; i < splitedContent.length-1; i+=3) {
            htmlCode += "<tr>" +
            "<td>" + userNum + "</td>" +
            "<td>" + splitedContent[i] + "</td>" +
            "<td>" + splitedContent[i+1] + "</td>" +
            "<td>" + splitedContent[i+2] + "</td></tr>";
            userNum++;
        }
        htmlCode += "</table></body></html>";
        res.send(
            htmlCode
        );
    });
});

module.exports = router;