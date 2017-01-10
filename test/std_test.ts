import "mocha";
import {expect} from "chai";
import {some, Option} from "../src/optics";

describe("some()", () => {
  const somePrism = some<number>();

  it("should get the value for a Some", () => {
    const option = Option.of(1);
    const result = somePrism.getOption(option);
    expect(result.get()).to.eql(1);
  });

  it("should return a None for a None", () => {
    const option = Option.none<number>();
    const result = somePrism.getOption(option);
    expect(result.isPresent).to.eql(false);
  });

  it("should set the value for a Some", () => {
    const option = Option.of(1);
    const result = somePrism.set(2)(option);
    expect(result.get()).to.eql(2);
  });

  it("should return a None when setting a None", () => {
    const option = Option.none<number>();
    const result = somePrism.set(2)(option);
    expect(result.isPresent).to.eql(false);
  });
});
