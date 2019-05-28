# Introduction

The program produces two output files:
 - The "not implemented" TypeScript file containing an empty implementation of all missing types and funcions.
 - The Angular generator's type mappings JSON file.

# Not implemented functions

It's a TypeScript file containing the definition of the types, methods and properties not yet implemented in the generator's standard classes.

## Types as classes

Types that have instance methods or any property (instance or class) are generated as classes.

### Example

Input:

```json
{
  "definitions": [
    {
        "description": "",
        "methods": [
          {
            "description": "",
            "parameters": [],
            "returns": "Boolean",
            "scopes": null,
            "name": "IsEmpty"
          }
        ],
        "name": "Numeric"
      }
  ]
}
```

Output:

```typescript
export class Numeric {
  /**
   * @return boolean
   */
  isEmpty(): boolean {
    notImplemented();
    return null;
  }
}
```

## Types as standalone functions

Types that only have class methods generate standalone functions.

### Example

Input:

```json
{
  "definitions": [
    {
      "name": "Core",
      "description": "",
      "methods": [
        {
          "description": "",
          "parameters": [
            {
              "accesstype": "in",
              "description": "",
              "type": "Date",
              "name": "Value"
            },
            {
              "accesstype": "in",
              "description": "",
              "type": "Numeric",
              "name": "Months"
            }
          ],
          "returns": "Date",
          "scopes": [],
          "static": true,
          "name": "AddMth"
        }
      ],
      "properties": [],
      "events": []
    }
  ]
}
```

Output:

```typescript
/**
 * @param value
 * @param months
 * @return Date
 */
export function addMth(value: Date, months: number): Date {
  notImplemented();
  return null;
}
```

## Properties generation

Properties are generated as TypeScript properties with a trivial implementation, unless the options file indicates not to generate classes.

That is, the getter and setter are generated (except for read-only properties) to read and write from a private member.

Static properties are generated as TypeScript static properties, and non-static properties are generated as instance properties.

### Example

Input:

```json
{
    "definitions": [
        {
            "description": "",
            "methods": [],
            "properties": [
                {
                    "description": "",
                    "readonly": false,
                    "type": "String",
                    "name": "Source"
                },
                {
                    "description": "",
                    "readonly": true,
                    "static": true,
                    "type": "String",
                    "name": "ApplicationDataPath"
                },
            ],
            "name": "Directory"
        }
    ]
}
```

Output:

```typescript
export class Directory {
  /**
   * 
   */
  private msource: any;
  get source(): any {
    return this.msource;
  }
  set source(value: any) {
    this.msource = value;
  }
  
  /**
   * 
   */
  private static mapplicationDataPath: any;
  static get applicationDataPath(): any {
    return this.mapplicationDataPath;
  }
}
```

### Properties when doNotGenerateClasses setting is set to true

If the `doNotGenerateClasses` setting is set to `true`, then classes are not generated and so properties cannot be generated either.

In such a case, the metadata JSON will indicate which propertoes are not included.

Example:

Input: 

```json
{
    "definitions": [
        {
            "description": "",
            "properties": [
                {
                    "description": "",
                    "readonly": false,
                    "type": "String",
                    "name": "Property"
                }
            ],
            "name": "Boolean"
        }
    ]
}
```

Options:

```json
{
    "notImplementedSettings": {
        "doNotGenerateClasses": true
    }
}
```

Output:

```json
{
  "modules": [
    {
      "name": "Boolean",
      "generatesClass": false,
      "properties": [
          {
              "name": "Property",
              "unavailable": true
          }
      ]
    }
  ]
}
```

# Angular generator's type mappings

The output mappings has the following format:

```javascript
{
  modules: IModuleEntry[]
}
```

```typescript
interface IModuleEntry {
    name: string;
    generatesClass: boolena;
    externalName: string
    methods: IMethodEntry[];
}

interface IMethodEntry {
    name: string;
    implementationName: string;
    externalName: string;
    extarnalModuleName: string;
}
```

Example:

```json
{
    "modules": [
        {
            "name": "Core",
            "generatesClass": false,
            "externalName": "Core",
            "methods": [
                {
                    "name": "LTrim",
                    "implementationName": "lTrim",                   
                    "externalName": "lTrim",
                    "externalModuleName": "@genexus/web-standard-functions/dist/lib-esm/text/ltrim"
                }
            ]
        }
    ]
}
```

# Angular generator's TypeScript index file

An index file is generated with an `export` for every type or function, so that this file can be imported in the Angular Generator's generated files without importing the types or functions one by one.

