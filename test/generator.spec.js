const generator = require("../generator");
const options = require("./options.json");
const fs = require("fs");

const testCases = [
  {
    "file_name": "std_func",
    "description": "simple function generation"
  },
  {
    "file_name": "std_type_method",
    "description": "standard type method generation"
  },
  {
    "file_name": "std_type_static_method",
    "description": "standard type static method generation"
  }
];

testCases.forEach((testCase) => {
  describe(testCase.description, () => {
    const metadata = require(`./${testCase.file_name}.json`);
    const expected = fs.readFileSync(`test/${testCase.file_name}.out.ts`, "utf8");
    const result = generator(metadata, options);
    it(`should work`, () => {
      expect(result).toEqual(expected);
    });
  })
});
