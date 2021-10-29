const Handlebars = require("handlebars");
const fs = require("fs");


function generate(metadata, options) {

  if (metadata) {

    return template(metadata);
  }

  return "";
}

function readTemplateFile(fileName) {
    return fs.readFileSync(`templates/${fileName}.hbs`, "utf8");
}


var template = Handlebars.compile(readTemplateFile('generate_index_web-standard-functions'));


module.exports = generate;