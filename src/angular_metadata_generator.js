"use strict";

const { sanitizeName, sanitizeClassName } = require("./helpers");

function generate(metadata, options) {
  let angularIndexPath = undefined;
  if (options.angularMappings) {
    angularIndexPath = options.angularMappings.angularIndexPath;
  }

  let includeUnavailableProperties = (options.notImplementedSettings !== undefined && options.notImplementedSettings.doNotGenerateClasses === true);

  if (metadata.definitions) {
    const output = metadata.definitions.map(def => {
      const isImplemented = def.isImplemented;
      let impPath = def.implementationPath;
      let genClass = isImplemented ? impPath !== undefined : def.generateClass;

      return {
        name: def.name,
        generatesClass: genClass,
        externalName: genClass ? sanitizeClassName(def.name) : undefined,
        externalModuleName: genClass ? angularIndexPath : undefined,
        methods: def.methods
          ? def.methods.map(meth => {
            return {
              name: meth.name,
              implementationName: meth.implementationName ? meth.implementationName : sanitizeName(meth.name),
              externalName: meth.implementationAlias ? meth.implementationAlias : sanitizeName(meth.name),
              externalModuleName: genClass ? undefined : angularIndexPath,
              isStatic: meth.static ? true : undefined
            };
          })
          : undefined,
        properties: def.properties !== undefined && includeUnavailableProperties
          ? def.properties.map(prop => {
            return {
              name: prop.name,
              unavailable: true
            }
          })
          : undefined
      };
    });
    return JSON.stringify({ modules: output });
  }
  return "";
}

module.exports = generate;
