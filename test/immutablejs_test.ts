import "mocha";
import {expect} from "chai";
import {List, Map} from "immutable";
import {index, head, tail, key} from "../src/optics";
import {findInList, at} from "../src/optics/immutablejs";
import {Option} from "../src/optics/option";

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

  describe("findInList()", () => {
    const valueWith2 = findInList(value => value == 2);

    it("should return a Some if the predicate is found", () => {
      const result = valueWith2.view(list);
      expect(result.get()).to.eql(2);
    });

    it("should return a None if the predicate is not found", () => {
      const result = findInList(value => value == 4).view(list);
      expect(result.isPresent).to.eql(false);
    });

    it("should modify the list for the value matching the predicate", () => {
      const newList = valueWith2.modify(() => Option.of(4))(list);
      expect(newList.toArray()).to.eql([1, 4, 3]);
    });

    it("should remove the element if None", () => {
      const newList = valueWith2.set(Option.none<number>())(list);
      expect(newList.toArray()).to.eql([1, 3]);
    });

    it("view <==> set should return same object", () => {
      // s: S => getOption(s).map{
      //   case Some(a) => set(a)(s) == s
      //   case None    => true
      // }
      const result = valueWith2.view(list).map(value => valueWith2.set(Option.of(value))(list));
      expect(result.get().toArray()).to.eql([1, 2, 3]);
    });

    it("getOption(set(a)(s)) == getOption(s).map(_ => a)", () => {
      // s: S => getOption(set(a)(s)) == getOption(s).map(_ => a)
      const result1 = valueWith2.view(valueWith2.set(Option.of(2))(list));
      const result2 = valueWith2.view(list);
      expect(result1.get()).to.eql(result2.get());
    });

    it("s: S, a: A  => set(set(a)(s), s) == set a s", () => {
      // s: S, a: A  => set(set(a)(s), s) == set a s
      const result1 = valueWith2.set(Option.of(4))(valueWith2.set(Option.of(4))(list));
      const result2 = valueWith2.set(Option.of(4))(list);
      expect(result1.toArray()).to.eql(result2.toArray());
    });
  });

  describe("at()", () => {
    const valueA = at<string, number>("a");

    it("should set a key and value in a map", () => {
      const result = valueA.set(Option.of(4))(map);
      expect(result.get("a")).to.eql(4);
    });

    it("should remove a key if none", () => {
      const result = valueA.set(Option.none<number>())(map);
      expect(result.get("a")).to.eql(undefined);
    });
  })
});
