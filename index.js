#! /usr/bin/env node
const fs = require("fs");
const cli = require("cli");
const generateTypescriptAPI = require("./src/ts_api_generator");
const generateAngularMetadata = require("./src/angular_metadata_generator");
const generateAngularIndex = require("./src/angular_index_generator");
const webStandardFunctionsIndex = require("./src/web-standard-functions_index")
const path = require("path");
const {
  preprocessForTypescriptAPI,
  preprocessForAngularMetadata,
  transformAttributeAndVariableMethods,
  getInfoForIndex,
  validate1,
  validate2

} = require("./src/preprocessor");

const parameters = cli.parse({
  options: ["o", "Path to the options file.", "file", ""]
});

if (!parameters.options) {
  cli.error("You must specify an options file to proceed.");
  return;
}

const options = JSON.parse(fs.readFileSync(/* absolutePath( */parameters.options)/* ) */);

if (!options) {
  return;
}

const metadataFilePath = /* absolutePath( */options["metadataFilePath"]/* ) */;
const rawMetadata = JSON.parse(fs.readFileSync(metadataFilePath));

const transformedMetadata = transformAttributeAndVariableMethods(rawMetadata);

const tsAPIMetadata = preprocessForTypescriptAPI(transformedMetadata, options);

generateOutput(
  options["notImplementedOutputFilePath"],
  generateTypescriptAPI,
  tsAPIMetadata
);

const mappingsMetadata = preprocessForAngularMetadata(transformedMetadata, options);

generateOutput(
  options["angularMappingsOutputFilePath"],
  generateAngularMetadata,
  mappingsMetadata
);

generateOutput(
  options["angularIndexOutputFilePath"],
  generateAngularIndex,
  mappingsMetadata
);


var aux = {"aux": getInfoForIndex(options), "notImplemented": tsAPIMetadata, "validate1": validate1(options,rawMetadata), "validate2": validate2(options)}

generateOutput(
  options["indexOutputFilePath"],
  webStandardFunctionsIndex,
  aux
);

//////// Helper functions

function generateOutput(outFileRelPath, generator, metadata) {
  const outFilePath = /* absolutePath( */outFileRelPath/* ) */;
  if (outFilePath) {
    const generated = generator(metadata, options);
    writeToFile(outFilePath, generated);
  }
}

function absolutePath(relPath) {
  if (!relPath) {
    return null;
  }
  if (path.isAbsolute(relPath)) {
    return relPath;
  } else {
    return path.join(__dirname, relPath);
  }
}

function writeToFile(fileRelPath, text) {
  const outFilePath = /* absolutePath( */fileRelPath/* ) */;
  fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
  fs.writeFileSync(outFilePath, text);
}
