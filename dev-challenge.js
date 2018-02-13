// Module imports
const fs = require('fs');
const _ = require('lodash');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
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
                "addresses": [],
                "invisible": false,
                "see_all": false
            };            
        }

        // Set the person "fullname" property
        if(row[0] !== '') {
            personData.fullname = row[0];
        }

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
            let classes = extractAllClassesFromString(row[classIndex]);
            classes.forEach(c => {
                if(_.indexOf(personData.classes,c) < 0 && c !== '') {
                    personData.classes.push(c);
                }
            });
            
        });

        // Get all classes and save them uniquely at "addresses" array
        addressIndexes.forEach(addresssIndex => {
            //console.log(row[addresssIndex]);
            var addresses = [];            
            var fieldInfo = tagInfo[addresssIndex];


            // Split all addresses in the same field
            if(fieldInfo.type === "email") {
                addresses = extractAllEmailsFromString(row[addresssIndex]);
            } else if (fieldInfo.type === "phone") {
                addresses = parseAndValidatePhoneFromString(row[addresssIndex]);
            }
// Refactor
            q = personData.addresses.reduce(function(qt,obj) {
                return qt + (obj.type === fieldInfo.type && _.isEqual(obj.tags, fieldInfo.tags) ? 1 : 0);
            }, 0);

            if(!flagNewPerson && fieldInfo.type === 'email' && _.compact(addresses).length >= q) {                
                for (let i = 0; i < personData.addresses.length; i++) {
                    var savedAddress = personData.addresses[i];
                    if(savedAddress.type === 'email' && _.isEqual(savedAddress.tags, fieldInfo.tags)) {
                        personData.addresses.splice(i,1);
                    }
                }           
            }

            addresses.forEach(a => {
                let addressItem = JSON.parse(JSON.stringify(fieldInfo));
                let flagUpdate = 0;                

                if(a !== '') {     
                    if(_.isEqual(personData.addresses,[])) {
                        addressItem.address = a;
                    } else {                        
                        personData.addresses.forEach(savedAddress => {
                            if(a === savedAddress.address) {
                                if(!_.isEqual(savedAddress.tags, addressItem.tags)) { 
                                    savedAddress.tags = _.union(savedAddress.tags, addressItem.tags);
                                    flagUpdate = 1;
                                }
                            } else {
                                addressItem.address = a;                           
                            }
                        });
                    }           
                    
                    if(!flagUpdate) {
                        personData.addresses.push(addressItem);                        
                    }

                    flagUpdate = 0;                    
                }
            });            
        });

        if(flagNewPerson) {
            outputData.push(personData);            
        }
    });
    
    console.log('Finish parsing data!');
}

function generateOutputFile(output) {
    fs.writeFile(OUTPUT_PATH,JSON.stringify(output),(err) =>{
        if (err) throw err;
        console.log('Output written to file!');
    });
    //console.log(output);
}

// Extract all classes present on a string and return an array of them
function extractAllClassesFromString(str) {
    let classes = str.split(/[^\w ]/);
    return _.map(classes,_.trim);
}

// Extract all emails present on a string and return an array of them
function extractAllEmailsFromString(str) {
    var ret = str.match(/([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g) ;
    return ret == null ? [] : ret;
}

// Extract all classes present on a string and return an array of them
function parseAndValidatePhoneFromString(str) {
    var ret = [];
    try {
        var number = phoneUtil.parse(str, 'BR');
        if (phoneUtil.isValidNumberForRegion(number,'BR')) {
            ret.push(phoneUtil.format(number, PNF.E164).replace('+',''));
        } else {
            throw "INVALID_PHONE_ERROR";
        }
    } catch(err) {
        ret.push('');
    }
    
    return ret;
}