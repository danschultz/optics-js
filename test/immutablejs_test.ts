import "mocha";
import {expect} from "chai";
import {List, Map} from "immutable";
import {index, head, tail, key} from "../src/optics";

describe("immutablejs", () => {
  const list = List<number>([1, 2, 3]);
  const map = Map<string, number>([["a", 1], ["b", 2], ["c", 3]]);

  describe("index()", () => {
    it("returns the object at index in a list", () => {
      expect(index<number>(1).view(list)).to.eql(list.get(1));
    });

    it("replaces the object at index in a list", () => {
      expect(index<number>(1).set(100)(list).get(1)).to.eql(100);
    });
  });

  describe("head()", () => {
    it("returns the object at head in a list", () => {
      expect(head<number>().view(list)).to.eql(list.first());
    });

    it("replaces the object at head in a list", () => {
      expect(head<number>().set(100)(list).first()).to.eql(100);
    });
  });

  describe("tail()", () => {
    it("returns the object at tail in a list", () => {
      expect(tail<number>().view(list)).to.eql(list.last());
    });

    it("replaces the object at tail in a list", () => {
      expect(tail<number>().set(100)(list).last()).to.eql(100);
    });
  });

  describe("key()", () => {
    it("returns the object for key in a map", () => {
      expect(key<string, number>("a").view(map)).to.eql(map.get("a"));
    });

    it("replaces the object for key in a map", () => {
      expect(key<string, number>("a").set(100)(map).get("a")).to.eql(100);
    });
  });
});
