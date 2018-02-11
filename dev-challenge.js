// Module imports
const fs = require('fs');
const lodash = require('lodash');
const libPhone = require('google-libphonenumber');
const csv = require("fast-csv");

// Constants
const INPUT_PATH = './input.csv';
const OUTPUT_PATH = './output.json';

// Reading and parsing data from CSV file
csv
    .fromPath(INPUT_PATH)
    .on("data", function (data) {
        extractCSVDataToJSON(data);
    })
    .on("end", function () {
        console.log("Finish reading data.");
    });


function extractCSVDataToJSON() {
    console.log(data);
}



