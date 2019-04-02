#! /usr/bin/env node
const fs = require("fs");
const cli = require("cli");
const generateTypescriptAPI = require("./src/ts_api_generator");
const generateAngularMetadata = require("./src/angular_metadata_generator");
const path = require("path");
const {
  preprocessForTypescriptAPI,
  preprocessForAngularMetadata
} = require("./src/preprocessor");

const parameters = cli.parse({
  options: ["o", "Path to the options file.", "file", ""]
});

if (!parameters.options) {
  cli.error("You must specify an options file to proceed.");
  return;
}

const options = JSON.parse(fs.readFileSync(absolutePath(parameters.options)));

const metadataFilePath = absolutePath(options["metadataFilePath"]);
const rawMetadata = JSON.parse(fs.readFileSync(metadataFilePath));

const tsAPIMetadata = preprocessForTypescriptAPI(rawMetadata, options);

const notImplementedOutputFilePath = absolutePath(options["notImplementedOutputFilePath"]);
if (notImplementedOutputFilePath) {
  const generatedTypescript = generateTypescriptAPI(tsAPIMetadata, options);
  writeToFile(notImplementedOutputFilePath, generatedTypescript);
}

const mappingsMetadata = preprocessForAngularMetadata(rawMetadata, options);

const angularMetadataOutputFilePath = absolutePath(options["angularMappingsOutputFilePath"]);
if (angularMetadataOutputFilePath) {
  const generatedMappings = generateAngularMetadata(mappingsMetadata, options);
  writeToFile(angularMetadataOutputFilePath, generatedMappings);
}

//////// Helper functions

function absolutePath(relPath) {
  if (path.isAbsolute(relPath)) {
    return relPath;
  } else {
    return path.join(__dirname, relPath);
  }
}

function writeToFile(fileRelPath, text) {
  const outFilePath = absolutePath(fileRelPath);
  fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
  fs.writeFileSync(outFilePath, text);
}
