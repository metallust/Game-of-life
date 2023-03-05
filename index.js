const { response } = require("express");
const express = require("express");
const app = express();
const fs = require("fs");
// const { type } = require("os");

app.listen(5500, () => console.log("listening at 3000"));
app.use(express.static("public"));

app.post("/random", (request, response) => {
    fs.readFile("./files names/rle.txt", (err, filenametext) => {
        if (err) {
            console.log(err);
            return;
        }
        fileName = String(filenametext).split("\n");
        fileName = fileName[Math.floor(Math.random() * fileName.length)];
        console.log("file name : " + fileName);
        fs.readFile("./all/" + fileName, (err, text) => {
            if (err) {
                console.log(err);
                return;
            }

            // sending the file
            response.json({
                status: "success",
                file: fileName,
                text: String(text),
            });
        });
    });
});

app.get("/search", (request, response) => {
    const searchterm = request.query.term;
    fs.readFile("./files names/rle.txt", (err, filenametext) => {
        if (err) {
            console.log(err);
            return;
        }
        files = String(filenametext)
            .split("\n")
            .filter((file) => file.includes(searchterm));
        response.json({
            status: "success",
            result: files,
        });
    });
});

app.get("/file", (request, response) => {
    const file = request.query.file;
    console.log(file);
    fs.readFile("./all/" + file, (err, text) => {
        if (err) {
            console.log(err);
            return;
        }
        response.json({
            status: "success",
            text: String(text),
        });
    });
});
