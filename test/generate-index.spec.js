"use strict";
const fs = require("fs");
const path = require("path");
const generate = require("../src/web-standard-functions_index");
const {
    preprocessForTypescriptAPI,
    transformAttributeAndVariableMethods,
    getInfoForIndex,
    validate1,
    validate2,
} = require("../src/preprocessor");
const Handlebars = require("handlebars");
  



describe('generate-index', () => {

  //Helpers Handlebars
  Handlebars.registerHelper("sanitizeClassName", function(name, options)
  {
    const cName = name.charAt(0).toUpperCase() + name.slice(1);
    return cName.replace(/(\.|\s|_)/g, "");
  });
  
  Handlebars.registerHelper("sanitizeName", function(name, options)
  {
    const cName = name.charAt(0).toLowerCase() + name.slice(1);
      return cName
                  .replace(/(\s|\||_)/g, "")
  
                  // replace keywords
                  .replace(/number/, "num")
                  .replace(/string/, "str");
  }); 

  //***options***//
  const optionsFilePath = `./generate-index/index-options.json`;
  const options = fs.existsSync(path.join(__dirname, optionsFilePath))
      ? require(optionsFilePath)
      : {};

  //****rawMetadata****//
  const rawMetadata = require(`./generate-index/index-metadata.json`);

  //****tsAPIMetadata****//
  const transformedMetadata = transformAttributeAndVariableMethods(rawMetadata);
  const tsAPIMetadata = preprocessForTypescriptAPI(transformedMetadata, options);

  //****Generate****//
  var aux = {"aux": getInfoForIndex(options,rawMetadata), "notImplemented": tsAPIMetadata, "validate1": validate1(options,rawMetadata), "validate2": validate2(options)}
    
  const generated = generate(aux,options);
  writeToFile(`test/generate-index/generate-result-test.js`, generated);

  function writeToFile(fileRelPath, text) {
    const outFilePath = /* absolutePath( */fileRelPath/* ) */;
    fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
    fs.writeFileSync(outFilePath, text);
  }

  //Index expected
  const expectedStr = fs.readFileSync(
      `test/generate-index/index-expected.js`,
      "utf8"
  );

  //Index result
  const resultStr = fs.readFileSync(
    `test/generate-index/generate-result-test.js`,
    "utf8"
  );


  //Test compare
  it(`should work`, () => {
    expect(resultStr).toEqual(expectedStr);
  });

});

