// Module imports
const fs = require('fs');
const lodash = require('lodash');
const libPhone = require('google-libphonenumber');
const csv = require("fast-csv");

// Constants
const INPUT_PATH = './input.csv';
const OUTPUT_PATH = './output.json';

var inputData = [];
var outputData = [];

// Reading and parsing data from CSV file
csv
    .fromPath(INPUT_PATH)
    .on("data", function (data) {
        inputData.push(data); 
    })
    .on("end", function () {
        
        console.log("Finish reading data.\n");
        extractCSVDataToJSON(inputData);
        generateOutputFile(outputData);
    });


function extractCSVDataToJSON(csvData) {
    
    // Extract addresses tags and types
    var header = csvData[0];
    var dataRows = csvData.slice(1);
    var tagInfo = [];

    // Check each column in the header
    header.forEach(element => {
        // Separate headers and tags
        element = element.replace(', ',',');
        let parts = element.split(' ');

        // Extract tags and types
        if(parts.length > 1) {
            var tags = parts[1].split(',');
            if(parts[0] === 'phone') {
                tagInfo.push({ "type": 'phone', "tags":tags });
            } else if (parts[0] === 'email') {
                tagInfo.push({ "type": 'email', "tags":tags });
            }
        } else {
            tagInfo.push(null);
        }        
        
    });

    // Treat each row of data
    dataRows.forEach(element => {        
        let flagNewPerson = false;

        // Check if already exists an object for the person searching by "eid"
        var personData = lodash.find(outputData,function(person) {
            return person.eid === element[1];
        });

        // If don't exist an object, creates it and set the "eid" and default properties
        if (personData == undefined) { 
            flagNewPerson = true;
            personData = { 
                "eid": element[1],
                "invisible": false,
                "see_all": false
            };
            
        }

        // Set the person "fullname" property
        personData.fullname = element[0];

        // Set the person "invisible" property
        let invisible = element[element.length-2];
        if(invisible !== '') {
            invisible == 1 ? personData.invisible = true : personData.invisible = false;
        }

        // Set the person "see_all" property
        let seeAll = element[element.length-1];
        if(seeAll !== '') {
            seeAll === 'yes' ? personData.see_all = true : personData.see_all = false;
        }

        console.log(personData);
        if(flagNewPerson) {
            outputData.push(personData);            
        }
    });
    
    console.log('Finish parsing data!');

    /*
    let test = JSON.parse(JSON.stringify(tagInfo[5]));
    test.address = "5464646";
    console.log(test);
    console.log(tagInfo);*/
}

function generateOutputFile(output) {
    fs.writeFile(OUTPUT_PATH,JSON.stringify(output),(err) =>{
        if (err) throw err;
        console.log('Output written to file!');
    });
    console.log(output);
}
