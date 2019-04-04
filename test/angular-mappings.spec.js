"use strict";

const generator = require('../src/angular_metadata_generator');
const fs = require("fs");
const path = require("path");
const {preprocessForAngularMetadata} = require("../src/preprocessor");

const testCasesBaseDirectory = "angular-mappings";

const testCases = [
    {
        "file_name": "not-implemented-method",
        "description": "Not implemented method"
    },
    {
        "file_name": "implemented-method",
        "description": "Already implemented method"
    },
    {
        "file_name": "ignored-type",
        "description": "Ignored type"
    }
];

testCases.forEach((testCase) => {
    describe(testCase.description, () => {
      const rawMetadata = require(`./${testCasesBaseDirectory}/${testCase.file_name}.json`);
      const optionsFilePath = `./${testCasesBaseDirectory}/${testCase.file_name}.options.json`;
      const options = fs.existsSync(path.join(__dirname, optionsFilePath)) ? require(optionsFilePath) : {};
      const metadata = preprocessForAngularMetadata(rawMetadata, options);
      const expectedStr = fs.readFileSync(`test/${testCasesBaseDirectory}/${testCase.file_name}.out.json`, "utf8");
      const expected = JSON.parse(expectedStr);
      const resultStr = generator(metadata, options);
      const result = JSON.parse(resultStr);
      it(`should work`, () => {
        expect(result).toEqual(expected);
      });
    })
  });
