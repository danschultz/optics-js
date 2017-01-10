import "mocha";
import {expect} from "chai";
import {List} from "immutable";
import {Prism} from "../src/optics/prism";
import {Option} from "../src/optics/option";

function cons<T>(): Prism<List<T>, [T, List<T>]> {
  return new Prism(
      (list: List<T>): Option<[T, List<T>]> => {
        if (list.size > 0) {
          return Option.of<[T, List<T>]>([list.first(), list.skip(1).toList()]);
        } else {
          return Option.none<[T, List<T>]>();
        }
      },
      (value: [T, List<T>]) => {
        const [head, tail] = value;
        return tail.unshift(head);
      });
}

const numbersToString = new Prism<[number, List<number>], string>(
    (obj) => {
      const list = cons<number>().reverseGet(obj);
      return Option.of(list.join(","));
    },
    str => {
      let elements = List(str.split(",").map(str => Number(str)));
      return [elements.first(), elements.skip(1).toList()];
    });

describe("Prism", () => {
  const list = List([1, 2, 3]);
  const emptyList = List([]);
  const numberCons = cons<number>();

  describe("getOption()", () => {
    it("should return a Some if matching", () => {
      const actual = numberCons.getOption(list);
      expect(actual.get()).to.eql([1, list.skip(1)]);
    });

    it("should return a None if not matching", () => {
      const actual = numberCons.getOption(emptyList);
      expect(actual.getOrNull()).to.be.null;
    });

    it("should be reversable", () => {
      const actual = numberCons.getOption(numberCons.reverseGet([10, list]));
      expect(actual.get()).to.eql([10, list]);
    });
  });

  describe("reverseGet()", () => {
    it("should modify the source of the prism", () => {
      const actual = numberCons.reverseGet([10, list]);
      expect(actual.toArray()).to.eql([10, 1, 2, 3]);
    });

    it("should be reversable", () => {
      const actual = numberCons.reverseGet(numberCons.getOption(list).get());
      expect(actual.toArray()).to.eql([1, 2, 3]);
    });
  });

  describe("modify()", () => {
    const negateHead = numberCons.modify(([head, tail]) => [-head, tail]);

    it("should set the value of a matching prism", () => {
      const actual = negateHead(list);
      expect(actual.toArray()).to.eql([-1, 2, 3]);
    });

    it("should return none for a non-matching prism", () => {
      const actual = negateHead(emptyList);
      expect(actual).to.eql(emptyList);
    });
  });

  describe("modifyOption()", () => {
    const negateHead = numberCons.modifyOption(([head, tail]) => [-head, tail]);

    it("should set the value of a matching prism", () => {
      const actual = negateHead(list);
      expect(actual.get().toArray()).to.eql([-1, 2, 3]);
    });

    it("should return none for a non-matching prism", () => {
      const actual = negateHead(emptyList);
      expect(actual.isPresent).to.eql(false);
    });
  });

  describe("composeLens()", () => {
    const numbersAsStrings = numberCons.compose(numbersToString);

    describe("getOption()", () => {
      it("should transform S => B", () => {
        expect(numbersAsStrings.getOption(list).get()).to.eql("1,2,3");
      });
    });

    describe("reverseGet()", () => {
      it("should transform B => S", () => {
        expect(numbersAsStrings.reverseGet("1,2,3").toArray()).to.eql([1, 2, 3]);
      });
    })
  });
});
