"use strict";

const generator = require("../src/angular_metadata_generator");
const fs = require("fs");
const path = require("path");
const { preprocessForAngularMetadata,addOptionsNotMetadata } = require("../src/preprocessor");

const testCasesBaseDirectory = "angular-mappings";

const testCases = [
  {
    file_name: "not-implemented-method",
    description: "Not implemented method"
  },
  {
    file_name: "implemented-method",
    description: "Already implemented method"
  },
  {
    file_name: "ignored-type",
    description: "Ignored type"
  },
  {
    file_name: "implemented-type-as-class",
    description: "Type implemented as a class"
  },
  {
    file_name: "implemented-method-static",
    description: "Already implemented static method"
  },
  {
    file_name: "implemented-func-renamed",
    description: "Already implemented function with a rename"
  },
  {
    file_name: "not-implemented-method-disambiguated",
    description: "Not implemented method with a disambiguation"
  },
  {
    file_name: "do-not-generate-class",
    description: "Explicitly indicated not to generate classes"
  },
  {
    file_name: "do-not-generate-class-available-property",
    description: "Explicitly indicated not to generate classes, with available properties provided by the generator"
  },
  {
    file_name: "implemented-func-notifies-generator",
    description: "Already implemented function that pushes a message to the generator"
  },
  {
    file_name: "implemented-func-async",
    description: "Already implemented function that must reflect async behavior"
  },
  {
    file_name: "implemented-func-lowercase-name",
    description: "Implemented function with lowercase name"
  },
  {
    file_name: "implemented-method-modifies-instance",
    description: "Implemented method modifies its instance"
  },
  {
    file_name: "implemented-property-as-method",
    description: "Property implemented as method"
  },
  {
    file_name: "exist-in-option-not-in-metadata",
    description: "Exist in option but not in metadata"
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

    addOptionsNotMetadata(options,rawMetadata).map(element => {
      metadata.definitions.push(element)
    })

    const expectedStr = fs.readFileSync(
      `test/${testCasesBaseDirectory}/${testCase.file_name}.out.json`,
      "utf8"
    );
    const expected = JSON.parse(expectedStr);
    const resultStr = generator(metadata, options);
    const result = JSON.parse(resultStr);
    it(`should work`, () => {
      expect(result).toEqual(expected);
    });
  });
});
