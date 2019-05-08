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
        result = `export {${def.name}} from "${impPath}";\n`;
      }
      else {
        for (const meth of def.methods) {
          let methImpPath = meth.implementationPath ? meth.implementationPath : defaultImplementationPath;
          let methodName = sanitizeName(meth.name);
          let externalName = meth.implementationAlias ? meth.implementationAlias : methodName;

          let as = "";
          if (methodName !== externalName) {
            as = ` as ${externalName}`;
          }

          result = result + `export {${methodName}${as}} from "${methImpPath}";\n`
        }
      }

      return result;
    });
    return output.join("");
  }
  return "";
}

module.exports = generate;
