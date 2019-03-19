const generator = require("../generator");
const options = require("./options.json");
const fs = require("fs");

describe("simple function generation", () => {
  var metadata = require("./std_func.json");
  var expected = fs.readFileSync("test/std_func.out.ts", "utf8");
  const result = generator(metadata, options);
  it(`should work`, () => {
    expect(result).toEqual(expected);
  });
});

describe("standard type method generation", () => {
  var metadata = require("./std_type_method.json");
  var expected = fs.readFileSync("test/std_type_method.out.ts", "utf8");
  const result = generator(metadata, options);
  it(`should work`, () => {
    expect(result).toEqual(expected);
  });
});
