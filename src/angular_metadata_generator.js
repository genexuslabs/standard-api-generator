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

      return {
        name: def.name,
        generatesClass: genClass,
        externalName: genClass ? sanitizeClassName(def.name) : undefined,
        externalModuleName: genClass ? impPath : undefined,
        methods: def.methods
          ? def.methods.map(meth => {
              let methImpPath = meth.implementationPath
                ? meth.implementationPath
                : defaultImplementationPath;
              return {
                name: meth.name,
                implementationName: meth.implementationName ? meth.implementationName : sanitizeName(meth.name),
                externalName: meth.implementationAlias ? meth.implementationAlias : sanitizeName(meth.name),
                externalModuleName: genClass ? undefined : methImpPath,
                isStatic: meth.static ? true : undefined
              };
            })
          : undefined
      };
    });
    return JSON.stringify({ modules: output });
  }
  return "";
}

module.exports = generate;
