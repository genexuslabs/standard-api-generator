#! /usr/bin/env node
const fs = require("fs");
const cli = require("cli");
const generateTypescriptAPI = require("./ts_api_generator");
const generateAngularMetadata = require("./angular_metadata_generator");
const {preprocess} = require("./preprocessor");
const path = require("path");

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

const metadata = preprocess(rawMetadata, options);

const notImplementedOutputFilePath = absolutePath(options["notImplementedOutputFilePath"]);
if (notImplementedOutputFilePath) {
  const generatedTypescript = generateTypescriptAPI(metadata, options);
  writeToFile(notImplementedOutputFilePath, generatedTypescript);
}

const angularMetadataOutputFilePath = absolutePath(options["angularMappingsOutputFilePath"]);
if (angularMetadataOutputFilePath) {
  const generatedMappings = generateAngularMetadata(metadata, options);
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
