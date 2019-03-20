const Handlebars = require("handlebars");
const fs = require("fs");
const preprocess = require("./preprocessor");

function generate(metadata, options) {
  if (metadata.definitions) {
    const processedMetadata = preprocess(metadata, options);
    return template(processedMetadata);
  }
  return "";
}

const template = Handlebars.compile(fs.readFileSync("templates/not_implemented.ts.hbs", "utf8"));

Handlebars.registerPartial(
  "generate_type",
  `
export class {{sanitizeClassName name}} {
{{#each methods}}
  {{> generate_method this}}
{{/each}}
{{#each properties}}
  {{> generate_property this}}
{{/each}}
}
`
);

Handlebars.registerPartial(
  "generate_method",
  `
/**
{{#if description}}
 * {{description}}
{{/if}}
{{#each parameters}}
 * @param {{sanitizeName name}}
{{/each}}
{{#if returns}}
 * @return {{mapType returns}}
{{/if}}
 */
static {{name}}({{#unless static}}self: any{{#if parameters.length}}, {{/if}}{{/unless}}{{#joinParameters parameters}}{{this}}{{/joinParameters}}){{#if returns}}: {{mapType returns}}{{/if}} {
  notImplemented();{{#if returns}}
  return null;{{/if}}
}
`
);

Handlebars.registerPartial(
  "generate_property",
  `
/**
 * {{description}}
 */
{{#if static}}static {{/if}} get {{sanitizeName name}}(): {{mapType type}} {
  notImplemented();
  return null;
}
{{#unless readonly}}{{#if static}}static {{/if}} set {{sanitizeName name}}(value: {{mapType type}}) {
  notImplemented();
}{{/unless}}
`
);

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

function sanitizeClassName(name) {
  return name.replace(/(\.|\s)/g, "_");
}

Handlebars.registerHelper("mapType", mapType);

Handlebars.registerHelper("sanitizeName", sanitizeName);

Handlebars.registerHelper("sanitizeClassName", sanitizeClassName);

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
