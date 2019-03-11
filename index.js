#! /usr/bin/env node
const fs = require("fs");
const cli = require("cli");
const generate = require("./generator");

const parameters = cli.parse({
  metadata: ["m", "Path to the metadata file.", "file", ""],
  options: ["o", "Path to the options file.", "file", ""]
});

if (!parameters.metadata) {
  cli.error("You must specify an input metadata file to proceed.");
  return;
}

if (!parameters.options) {
  cli.error("You must specify an options file to proceed.");
  return;
}

let metadata = JSON.parse(
  fs.readFileSync(__dirname + "/" + parameters.metadata)
);
let options = JSON.parse(fs.readFileSync(__dirname + "/" + parameters.options));

cli.output(generate(metadata, options));
