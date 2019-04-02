"use strict";

const { mergeOverloadedMethods } = require("../src/preprocessor");

describe('definition with no methods', () => {
  const metadata = createDefinition('[]');
  const result = mergeOverloadedMethods(metadata)
  it(`should not change`, () => {
    expect(result).toEqual(metadata);
  });
});

describe('definition with one method', () => {
  const metadata = createDefinition(`[
    ${createMethod("Method", "String", "[]", true)}
  ]`);
  const result = mergeOverloadedMethods(metadata)
  it(`should not change`, () => {
    expect(result).toEqual(metadata);
  });
});

describe('definition with two different method', () => {
  const metadata = createDefinition(`[
    ${createMethod("Method1", "String", "[]", true)},
    ${createMethod("Method2", "String", "[]", true)}
  ]`);
  const result = mergeOverloadedMethods(metadata)
  it(`should not change`, () => {
    expect(result).toEqual(metadata);
  });
});

describe('definition with one static and one instance method named the same', () => {
  const metadata = createDefinition(`[
    ${createMethod("Method1", "String", "[]", true)},
    ${createMethod("Method1", "String", "[]", false)}
  ]`);
  const result = mergeOverloadedMethods(metadata)
  it(`should not change`, () => {
    expect(result).toEqual(metadata);
  });
});

describe('definition with the same method with same number of parameters of different type', () => {
  const metadata = createDefinition(`[
    ${createMethod("Method1", "String", `[${createParameter("Value", "String", "in")}]`, false)},
    ${createMethod("Method1", "String", `[${createParameter("Other", "Numeric", "in")}]`, false)}
  ]`);
  const result = mergeOverloadedMethods(metadata)
  it(`should merge`, () => {
    expect(result).toEqual(
      createDefinition(`[
        ${createMethod("Method1", "String", `[${createParameter("Value", "any", "in")}]`, false)}
      ]`)
    );
  });
});

describe('definition with the same method with different number of parameters of the same type', () => {
  const metadata = createDefinition(`[
    ${createMethod("Method1", "String", `[${createParameter("Value", "String", "in")}]`, false)},
    ${createMethod("Method1", "String", `[
      ${createParameter("Value", "String", "in")},
      ${createParameter("Other", "Numeric", "in")}
    ]`, false)}
  ]`);
  const result = mergeOverloadedMethods(metadata)
  it(`should merge`, () => {
    expect(result).toEqual(
      createDefinition(`[
      ${createMethod("Method1", "String", `[
        ${createParameter("Value", "String", "in")},
        ${createParameter("Other", "Numeric", "in", true)}
      ]`, false)}
    ]`)
    );
  });
});


function createDefinition(methods) {
  return JSON.parse(`{
    "definitions": [
      {
        "name": "Test",
        "description": "",
        "methods": ${methods}
      }
    ]
  }`);
}

function createMethod(name, returns, parameters, isStatic) {
  return `{
    "name": "${name}",
    "description": "",
    "static": ${isStatic},
    "parameters": ${parameters},
    "returns": "${returns}"
  }`
}

function createParameter(name, type, access = "in", optional = false) {
  return `{
    "accesstype": "${access}",
    "description": "",
    "type": "${type}",
    "name": "${name}",
    "optional": ${optional}
  }`;
}
