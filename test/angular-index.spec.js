"use strict";

const generator = require("../src/angular_index_generator");
const fs = require("fs");
const path = require("path");
const { preprocessForAngularMetadata } = require("../src/preprocessor");

const testCasesBaseDirectory = "angular-index";

const testCases = [
  {
    file_name: "simple-function",
    description: "Simple function"
  }
];

testCases.forEach(testCase => {
  describe(testCase.description, () => {
    const rawMetadata = require(`./${testCasesBaseDirectory}/${
      testCase.file_name
    }.json`);
    const optionsFilePath = `./${testCasesBaseDirectory}/${
      testCase.file_name
    }.options.json`;
    const options = fs.existsSync(path.join(__dirname, optionsFilePath))
      ? require(optionsFilePath)
      : {};
    const metadata = preprocessForAngularMetadata(rawMetadata, options);
    const expectedStr = fs.readFileSync(
      `test/${testCasesBaseDirectory}/${testCase.file_name}.index.ts.txt`,
      "utf8"
    );
    const resultStr = generator(metadata, options);
    it(`should work`, () => {
      expect(resultStr).toEqual(expectedStr);
    });
  });
});
