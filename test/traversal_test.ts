import "mocha";
import {expect} from "chai";
import {ListTraversal} from "../src/optics/traversal";
import {allDepartments, university, lecturers, Lecturer, firstName, LessThanOptional} from "./university";
import {Option} from "../src/optics/option";

describe("Traversal", () => {
  const allLecturers = allDepartments.composeLens(lecturers).composeTraversal(new ListTraversal<Lecturer>());
  const lowPaidLecturers = allLecturers.composeOptional(new LessThanOptional<Lecturer, number>("salary", 15));

  describe("find()", () => {
    it("should return the elements matching the predicate", () => {
      const result = allLecturers.find(lecturer => lecturer.firstName === "john")(university);
      expect(result.get().firstName).to.eql("john");
    });
  });

  describe("composeLens()", () => {
    it("should return a traversal composed with a lens", () => {
      const result = allLecturers.getAll(university);
      expect(result.length).to.eql(3);
    });
  });

  describe("composeOptional()", () => {
    it("should return a traversal that meets optional requirements", () => {
      const result = lowPaidLecturers.getAll(university);
      expect(result).to.eql([10, 10]);
    });

    it("should modify objects that meet optional requirements", () => {
      const increasePay = lowPaidLecturers.modify(() => 20);
      const newUniversity = increasePay(university);
      const result = lowPaidLecturers.getAll(newUniversity);
      expect(result).to.eql([]);
    });
  });

  describe("getAll()", () => {
    it("should return all elements", () => {
      const result = allDepartments.getAll(university);
      expect(result.length).to.eql(2);
    })
  });

  describe("modify()", () => {
    it("should set the value for each element in the traversal", () => {
      const capitalize = (word: string): string => `${word[0].toUpperCase()}${word.slice(1)}`;
      const newUniversity = allLecturers.composeLens(firstName).modify(capitalize)(university);
      const result = allLecturers.getAll(newUniversity);
      expect(result[0].firstName).to.eql("John");
    });
  });

  describe("modifyOption()", () => {
    it("should set the value for each Some", () => {
      const increasePay = (lecturer: Lecturer): Option<Lecturer> => {
        const newLecterer = Object.assign({}, lecturer, {salary: 20});
        return lecturer.salary < 15 ? Option.of<Lecturer>(newLecterer) : Option.none<Lecturer>();
      };
      const newUniversity = allLecturers.modifyOption(increasePay)(university);
      const result = allLecturers.getAll(newUniversity.get()).filter(lecturer => lecturer.salary === 20);
      expect(result.length).to.eql(2);
    });
  });
});
