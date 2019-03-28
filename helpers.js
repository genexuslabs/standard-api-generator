"use strict";

function sanitizeName(name) {
    const cName = name.charAt(0).toLowerCase() + name.slice(1);
    return cName
                .replace(/(\s|\||_)/g, "")

                // replace keywords
                .replace(/number/, "num")
                .replace(/string/, "str");


}

function sanitizeClassName(name) {
    const cName = name.charAt(0).toUpperCase() + name.slice(1);
    return cName.replace(/(\.|\s|_)/g, "");
}

module.exports = {
    sanitizeName: sanitizeName,
    sanitizeClassName: sanitizeClassName
}