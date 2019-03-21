const generator = require("../generator");
const fs = require("fs");
const path = require("path");

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
  },
  {
    "file_name": "implemented_method",
    "description": "method already marked as implemented"
  },
  {
    "file_name": "ignored_method",
    "description": "method marked as ignored (not to be implemented)"
  },
  {
    "file_name": "implemented_class",
    "description": "class already marked as implemented"
  },
  {
    "file_name": "std_type_property",
    "description": "standard type property"
  },
  {
    "file_name": "std_type_static_property",
    "description": "standard type static property"
  },
  {
    "file_name": "std_type_readonly_property",
    "description": "standard type redonly properties (static & instance)"
  }
];

testCases.forEach((testCase) => {
  describe(testCase.description, () => {
    const metadata = require(`./${testCase.file_name}.json`);
    const optionsFilePath = `./${testCase.file_name}.options.json`;
    const options = fs.existsSync(path.join(__dirname, optionsFilePath)) ? require(optionsFilePath) : {};
    const expected = fs.readFileSync(`test/${testCase.file_name}.out.ts`, "utf8");
    const result = generator(metadata, options);
    it(`should work`, () => {
      expect(result).toEqual(expected);
    });
  })
});
