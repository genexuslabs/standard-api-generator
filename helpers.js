"use strict";

function sanitizeName(name) {
    const cName = name.charAt(0).toLowerCase() + name.slice(1);
    return cName.replace(/(\s|\|)/g, "_");
}

function sanitizeClassName(name) {
    const cName = name.charAt(0).toUpperCase() + name.slice(1);
    return cName.replace(/(\.|\s)/g, "_");
}

module.exports = {
    sanitizeName: sanitizeName,
    sanitizeClassName: sanitizeClassName
}