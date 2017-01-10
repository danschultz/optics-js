import "mocha";
import {expect} from "chai";
import {ListTraversal} from "../src/optics/traversal";
import {allDepartments, university, lecturers, Lecturer, firstName, departments, Department} from "./university";
import {Option} from "../src/optics/option";
import {findInList, prop, key, appendToList} from "../src/optics/immutablejs";
import {List} from "immutable";
import {compose, some} from "../src/optics";

describe("Traversal", () => {
  const allLecturers = allDepartments.composeLens(lecturers).composeTraversal(new ListTraversal<Lecturer>());

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

  describe("composePrism()", () => {
    const johnDoe = allDepartments
        .composeLens(lecturers)
        .composeLens(findInList<Lecturer>(lecturer => lecturer.firstName == "john" && lecturer.lastName == "doe"))
        .composePrism(some<Lecturer>());

    it("should return a traversal that meets optional requirements", () => {
      const result = johnDoe.getAll(university);
      expect(result[0]).to.eql({firstName: "john", lastName: "doe", salary: 10});
    });

    it("should modify objects that meet optional requirements", () => {
      const increasePay = johnDoe.composeLens(prop<Lecturer, number>("salary")).modify(() => 20);
      const newUniversity = increasePay(university);
      const result = johnDoe.getAll(newUniversity);
      expect(result[0]).to.eql({firstName: "john", lastName: "doe", salary: 20});
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
      const capitalize = (word: string): string => (`${word[0].toUpperCase()}${word.slice(1)}`);
      const newUniversity = allLecturers.composeLens(firstName).modify(capitalize)(university);
      const result = allLecturers.getAll(newUniversity);
      expect(result[0].firstName).to.eql("John");
    });
  });

  describe("modifyOption()", () => {
    it("should set the value for each Some", () => {
      const increasePay = (lecturer: Lecturer): Option<Lecturer> => {
        const newLecturer = Object.assign({}, lecturer, {salary: 20});
        return lecturer.salary < 15 ? Option.of<Lecturer>(newLecturer) : Option.none<Lecturer>();
      };
      const newUniversity = allLecturers.modifyOption(increasePay)(university);
      const result = allLecturers.getAll(newUniversity.get()).filter(lecturer => lecturer.salary === 20);
      expect(result.length).to.eql(2);
    });
  });
});

describe("throw away", () => {
  const comsci = departments.composeLens(key<string, Department>("Computer Science"));
  const history = departments.composeLens(key<string, Department>("History"));

  it("moves lecturer to history", () => {
    const comsciLecturers = comsci.composeLens(lecturers);
    const historyLecturers = history.composeLens(lecturers);
    const changes = [
      comsciLecturers.set(List<Lecturer>()),
      historyLecturers.modify(appendToList(comsciLecturers.view(university)))
    ];
    const result = compose(...changes)(university);
    expect(comsciLecturers.view(result).size).to.eql(0);
    expect(historyLecturers.view(result).size).to.eql(3);
  });
});
