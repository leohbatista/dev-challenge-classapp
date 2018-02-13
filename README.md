# Dev Challenge - ClassApp

## Description
This program is an implementation of [ClassApp dev_challenge](https://gist.github.com/samin/3a75a44d94a8dbd48a95, "Link to dev_challenge problem") problem, that consists in extract specific data from a _.csv_ file and outputs it on a _.json_ file in a specific form.

## Installation
Before you run or develop this code, run the following command:
```
npm install
```

To run, execute:
```
node dev-challenge.js
```

## Input and Output
**Input:** This program receives a _.csv_ file with headers and data. You can access an example of input [clicking here](https://github.com/leohbatista/dev-challenge-classapp/blob/master/input.csv "Input Example")
**Output:** This program produces a _.json_ file with structured data from the .csv content. You can access an example of output [clicking here](https://github.com/leohbatista/dev-challenge-classapp/blob/master/output.json "Output Example")

To set the input/output PATH, you should change the constants **_INPUT_PATH_** and **_OUTPUT_PATH_**. By default these constants are setted as:
```javascript
// Constants
const INPUT_PATH = './input.csv';
const OUTPUT_PATH = './output.json';
```

## Implementation Characteristics

### Fields
This program supports the following order to input data fields:
1. **fullname** field
2. **eid** field
3. a variable number of **class** fields
4. a variable number of **phone** and **email** fields with multiple tags
5. **invisible** field
6. **see_all** field

### Observations
* The identifier is the **eid** field. Two rows with same value for this field will be merged.
* On merge process:  
    * The fields **fullname**, **invisible** and **see_all** are updated if not empty
    * The new **classes** are appended
    * Each new valid **phone** is appended to **addresses** array
    * New valid **email** addresses replaces the old ones only if the new quantity is more or equal than the old quantity