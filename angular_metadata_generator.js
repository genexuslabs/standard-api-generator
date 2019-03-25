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
                "externalModuleName": "",    // TODO
                "methods": def.methods ? def.methods.map((meth) => {
                    return {
                        "name": meth.name,
                        "externalName": sanitizeName(meth.name)
                    }
                }) : []
            }
        });
        return JSON.stringify({ "modules": output });
    }
    return "";
}

module.exports = generate;