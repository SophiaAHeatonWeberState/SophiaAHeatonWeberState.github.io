const express = require("express");
const cors = require("cors");
const dbo = require("./db/conn");
require("dotenv").config({ path: "./config.env" });

const app = express();
const port = process.env.PORT;


app.use(cors());
app.use(express.json());
app.use(require("./routes/data"));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    dbo.connectToServer(function(err) {
        if (err) {
            console.err(err);
        }
    });
    console.log(`Server is running on port ${port}`);
});