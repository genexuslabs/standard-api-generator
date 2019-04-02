"use strict";

const {
    sanitizeName,
    sanitizeClassName
} = require("./helpers");

function generate(metadata, options) {
    let defaultImplementationPath = undefined;
    if (options.angularMappings) {
        defaultImplementationPath = options.angularMappings.defaultModulesPath
    }

    if (metadata.definitions) {
        const output = metadata.definitions.map((def) => {
            const genClass = def.generateClass;
            let impPath = undefined;
            if (genClass) {
                impPath = def.implementationPath ? def.implementationPath : defaultImplementationPath;
            }

            return {
                "name": def.name,
                "generatesClass": genClass,
                "externalName": sanitizeClassName(def.name),
                "externalModuleName": impPath,
                "methods": def.methods ? def.methods.map((meth) => {
                    let methImpClass = undefined;
                    if (!genClass) {
                        methImpClass = meth.implementationPath ? meth.implementationPath : defaultImplementationPath;
                    }

                    return {
                        "name": meth.name,
                        "externalName": meth.implementationAlias ? meth.implementationAlias : sanitizeName(meth.name),
                        "externalModuleName": methImpClass
                    }
                }) : undefined
            }
        });
        return JSON.stringify({ "modules": output });
    }
    return "";
}

module.exports = generate;