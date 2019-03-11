const Handlebars = require("handlebars");

function generate(metadata, options) {
  if (metadata.definitions) {
    return template(metadata);
  }
  return "";
}

const template = Handlebars.compile(`
function notImplemented() {
  console.log("Not yet implemented");
}

{{#each definitions}}
{{#each methods}}
/**
*
{{#each parameters}}
* @param {{sanitizeName name}}
{{/each}}
{{#if returns}}
* @return {{mapType returns}}
{{/if}}
*/
export function {{name}}({{#joinParameters parameters}}{{this}}{{/joinParameters}}){{#if returns}}: {{mapType returns}}{{/if}} {
  notImplemented();
};

{{/each}}
{{/each}}
`);

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
  return name.replace(/\s/g, "_");
}

Handlebars.registerHelper("mapType", mapType);

Handlebars.registerHelper("sanitizeName", sanitizeName);

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
