"use strict";

const { sanitizeName, sanitizeClassName } = require("./helpers");

function generate(metadata, options) {
  let defaultImplementationPath = undefined;
  if (options.angularMappings) {
    defaultImplementationPath = options.angularMappings.defaultModulesPath;
  }

  if (metadata.definitions) {
    const output = metadata.definitions.map(def => {
      const isImplemented = def.isImplemented;
      let impPath = def.implementationPath;
      let genClass = isImplemented ? impPath !== undefined : def.generateClass;
      if (!impPath) {
        impPath = defaultImplementationPath;
      }

      let result = "";

      if (genClass) {
        result = `export {${sanitizeClassName(def.name)}} from "${impPath}";\n`;
      }
      else if (def.methods) {
        for (const meth of def.methods) {
          let methImpPath = meth.implementationPath ? meth.implementationPath : defaultImplementationPath;
          let methodName = sanitizeName(meth.name);
          let methImpName = meth.implementationName ? meth.implementationName : methodName;
          let methImpAlias = meth.implementationAlias;

          let as = (methImpAlias && methImpAlias !== methImpName) ? ` as ${methImpAlias}` : "";
          result = result + `export {${methImpName}${as}} from "${methImpPath}";\n`
        }
      }

      return result;
    });
    return output.join("");
  }
  return "";
}

module.exports = generate;
