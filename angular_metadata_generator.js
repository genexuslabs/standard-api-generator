"use strict";

const {
    sanitizeName,
    sanitizeClassName
} = require("./helpers");

function generate(metadata, options) {
    if (metadata.definitions) {
        const output = metadata.definitions.map((def) => {
            return {
                "name": def.name,
                "generatesClass": def.generateClass,
                "externalName": sanitizeClassName(def.name),
                "externalModuleName": def.implementationPath,
                "methods": def.methods ? def.methods.map((meth) => {
                    return {
                        "name": meth.implementationAlias ? meth.implementationAlias : meth.name,
                        "externalName": sanitizeName(meth.name),
                        "externalModuleName": meth.implementationPath
                    }
                }) : []
            }
        });
        return JSON.stringify({ "modules": output });
    }
    return "";
}

module.exports = generate;