"use strict";

const generator = require("../src/ts_api_generator");
const fs = require("fs");
const path = require("path");
const {preprocessForTypescriptAPI} = require("../src/preprocessor");

const testCasesBaseDirectory = "ts-api-generator";

const testCases = [
  {
    "file_name": "std_func",
    "description": "simple function generation"
  },
  {
    "file_name": "std_type_method",
    "description": "standard type method generation"
  },
  {
    "file_name": "std_type_static_method",
    "description": "standard type static method generation"
  },
  {
    "file_name": "implemented_method",
    "description": "method already marked as implemented"
  },
  {
    "file_name": "ignored_method",
    "description": "method marked as ignored (not to be implemented)"
  },
  {
    "file_name": "implemented_class",
    "description": "class already marked as implemented"
  },
  {
    "file_name": "std_type_property",
    "description": "standard type property"
  },
  {
    "file_name": "std_type_static_property",
    "description": "standard type static property"
  },
  {
    "file_name": "std_type_readonly_property",
    "description": "standard type redonly properties (static & instance)"
  },
  {
    "file_name": "disambiguated_method",
    "description": "disambiguated method"
  },
  {
      "file_name": "ignored_type",
      "description": "Ignored type"
  },
  {
      "file_name": "partially_implemented_class",
      "description": "Partially implemented class implemented as functions"
  }
];

testCases.forEach((testCase) => {
  describe(testCase.description, () => {
    const rawMetadata = require(`./${testCasesBaseDirectory}/${testCase.file_name}.json`);
    const optionsFilePath = `./${testCasesBaseDirectory}/${testCase.file_name}.options.json`;
    const options = fs.existsSync(path.join(__dirname, optionsFilePath)) ? require(optionsFilePath) : {};
    const metadata = preprocessForTypescriptAPI(rawMetadata, options);
    const expected = fs.readFileSync(`test/${testCasesBaseDirectory}/${testCase.file_name}.out.ts`, "utf8");
    const result = generator(metadata, options);
    it(`should work`, () => {
      expect(result).toEqual(expected);
    });
  })
});
