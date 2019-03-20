#! /usr/bin/env node
const fs = require("fs");
const cli = require("cli");
const generate = require("./generator");
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
const metadata = JSON.parse(fs.readFileSync(metadataFilePath));

const generated = generate(metadata, options);

writeToFile(options["outputFilePath"], generated);

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
