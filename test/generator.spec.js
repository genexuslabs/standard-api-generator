const generator = require("../generator");
const options = require("./options.json");
const metadata = require("./metadata.json");

describe("simple function generation", () => {
  const result = generator(metadata, options);
  it(`should work`, () => {
    expect(result).toBe(`
function notImplemented() {
  console.log("Not yet implemented");
}

/**
*
* @param Value
* @param Months
*/
export function AddMth(Value: Date, Months: number) {
  notImplemented();
};

`);
  });
});
