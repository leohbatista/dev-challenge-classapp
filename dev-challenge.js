// Module imports
const fs = require('fs');
const _ = require('lodash');
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
    var classIndexes = [];
    var addressIndexes = [];

    // Check each column in the header
    let counter = 0;
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
            addressIndexes.push(counter);
        } else {
            tagInfo.push(null);
            
            if(parts[0] === 'class') {
                classIndexes.push(counter);  
            }
        }    
        
        counter++;
    });

    // Treat each row of data
    dataRows.forEach(row => {        
        let flagNewPerson = false;

        // Check if already exists an object for the person searching by "eid"
        var personData = _.find(outputData,function(person) {
            return person.eid === row[1];
        });

        // If don't exist an object, creates it and set the "eid" and default properties
        if (personData == undefined) { 
            flagNewPerson = true;
            personData = { 
                "eid": row[1],
                "classes": [],
                "invisible": false,
                "see_all": false
            };
            
        }

        // Set the person "fullname" property
        personData.fullname = row[0];

        // Set the person "invisible" property
        let invisible = row[row.length-2];
        if(invisible !== '') {
            invisible == 1 ? personData.invisible = true : personData.invisible = false;
        }

        // Set the person "see_all" property
        let seeAll = row[row.length-1];
        if(seeAll !== '') {
            seeAll === 'yes' ? personData.see_all = true : personData.see_all = false;
        }

        // Get all classes and save them uniquely at "classes" array
        classIndexes.forEach(classIndex => {
            let classes = row[classIndex].split(/[^\w ]/);
            classes = _.map(classes,_.trim);
            classes.forEach(c => {
                if(_.indexOf(personData.classes,c) < 0 && c !== '') {
                    personData.classes.push(c);
                }
            });
            
        });

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
