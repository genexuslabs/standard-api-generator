const Handlebars = require("handlebars");
const fs = require("fs");
const {preprocess} = require("./preprocessor");

function generate(metadata, options) {
  if (metadata.definitions) {
    const processedMetadata = preprocess(metadata, options);
    return template(processedMetadata);
  }
  return "";
}

function readTemplateFile(fileName) {
  return fs.readFileSync(`templates/${fileName}.hbs`, "utf8");
}

function readPartialTemplateFile(partialName) {
  return readTemplateFile(`${partialName}.partial`);
}

function registerPartial(partialName) {
  const partialContent = readPartialTemplateFile(partialName);
  if (partialContent) {
    Handlebars.registerPartial(partialName, partialContent);
  } else {
    throw `Could not read Handlebars partial file named ${partialName}`;
  }
}

const template = Handlebars.compile(readTemplateFile("not_implemented.ts"));

registerPartial("generate_type");
registerPartial("generate_method");
registerPartial("generate_property");
registerPartial("generate_standalone_function");

const IndeterminateDataType = "any";
const ObjectDataType = "any";

const TypeMappings = {
  Character: "string",
  Expression: "string",
  Date: "Date",
  "Date/DateTime": "Date",
  DateTime: "Date",
  Numeric: "number",
  Object: ObjectDataType
};

function mapType(sourceType) {
  if (!sourceType) {
    return IndeterminateDataType;
  }

  const targetType = TypeMappings[sourceType];

  if (targetType === undefined) {
    return IndeterminateDataType;
  }

  return targetType;
}

function sanitizeName(name) {
  const cName = name.charAt(0).toLowerCase() + name.slice(1);
  return cName.replace(/(\s|\|)/g, "_");
}

function sanitizeClassName(name) {
  const cName = name.charAt(0).toUpperCase() + name.slice(1);
  return cName.replace(/(\.|\s)/g, "_");
}

function privateMemberName(name) {
  return `m_${sanitizeName(name)}`;
}

Handlebars.registerHelper("mapType", mapType);

Handlebars.registerHelper("sanitizeName", sanitizeName);

Handlebars.registerHelper("sanitizeClassName", sanitizeClassName);

Handlebars.registerHelper("privateMemberName", privateMemberName);

Handlebars.registerHelper("joinParameters", function(items, options) {
  if (!items) {
    return options.fn("");
  }

  const usedNames = {};
  const dedupeNames = function(inputName) {
    if (!usedNames[inputName]) {
      usedNames[inputName] = 1;
      return inputName;
    } else {
      return inputName + ++usedNames[inputName];
    }
  };

  return options.fn(
    items
      .map(x => {
        const name = dedupeNames(sanitizeName(x.name));
        const type = mapType(x.type);
        const optional = x.optional === "optional" ? "?" : "";

        return `${name}${optional}: ${type}`;
      })
      .join(", ")
  );
});

module.exports = generate;
