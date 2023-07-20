"use strict";

const { sanitizeName, sanitizeClassName } = require("./helpers");

function generate(metadata, options) {
  let angularIndexPath;
  let defaultImplementationPath;
  if (options.angularMappings) {
    defaultImplementationPath = options.angularMappings.defaultModulesPath;
    angularIndexPath = options.angularMappings.angularIndexPath;
  }

  let includeUnavailableProperties =
    options.notImplementedSettings !== undefined &&
    options.notImplementedSettings.doNotGenerateClasses === true;

  if (metadata.definitions) {
    const output = metadata.definitions.map(def => {
      const isImplemented = def.isImplemented;
      let impPath = def.implementationPath;
      let genClass = isImplemented ? impPath !== undefined : def.generateClass;
      if (!impPath) {
        impPath = defaultImplementationPath;
      }

      let methods = def.methods
        ? def.methods.map(meth => {
          let methImpPath = meth.implementationPath
            ? meth.implementationPath
            : defaultImplementationPath;
          return {
            name: meth.name,
            implementationName: meth.implementationName
              ? meth.implementationName
              : sanitizeName(meth.name),
            externalName: meth.implementationAlias
              ? meth.implementationAlias
              : sanitizeName(meth.name),
            externalModuleName: genClass
              ? undefined
              : angularIndexPath || methImpPath,
            isStatic: meth.static ? true : undefined,
            notifiesGenerator: meth.notifiesGenerator ? true : undefined,
            modifiesInstance: meth.modifiesInstance ? true : undefined,
            isAsync: meth.isAsync ? true : undefined,
            returns: meth.returns === "Any" ? "Unknown" : meth.returns
          };
        })
        : undefined;

      let properties = def.properties !== undefined && includeUnavailableProperties
        ? def.properties.filter(prop => !prop.asMethod).map(prop => {
          return {
            name: prop.name,
            unavailable:
              prop.unavailable !== undefined ? prop.unavailable : true
          };
        })
        : undefined;

      let propsAsMethods = (def.properties !== undefined)
        ? def.properties.filter(prop => prop.asMethod === true).map(prop => {
          return {
            name: prop.name,
            implementationName: sanitizeName(prop.name),
            externalName: sanitizeName(prop.name),
            isStatic: true
          };
        })
        : undefined;

      if (propsAsMethods !== undefined && propsAsMethods.length > 0) {
        if (!methods) {
          methods = propsAsMethods
        }
        else {
          methods = methods.concat(propsAsMethods);
        }
      }

      return {
        name: def.name,
        generatesClass: genClass,
        externalName: genClass ? sanitizeClassName(def.name) : undefined,
        externalModuleName: genClass ? angularIndexPath || impPath : undefined,
        methods: methods,
        properties: properties
      };
    });
    return JSON.stringify({ modules: output });
  }
  return "";
}

module.exports = generate;
