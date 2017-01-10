import "mocha";
import {expect} from "chai";
import {Lens, index, key, head} from "../src/optics";
import {name, university, departments, lecturers, Department, Lecturer} from "./university";
import {Option} from "../src/optics/option";

describe("Lens", () => {
  const historyDepartment = key<string, Department>("History");
  const historyLecturers = historyDepartment.compose(lecturers);
  const firstHistoryLecturer = departments.compose(historyLecturers.compose(head<Lecturer>()));

  describe("get()", () => {
    it("returns the value of the object", () => {
      expect(name.view(university)).to.eql("Iowa State");
    });
  });

  describe("set()", () => {
    it("returns a new object with the value set", () => {
      expect(name.set("foo")(university).name).to.eql("foo");
    });
  });

  describe("then()", () => {
    it("composes two lenses", () => {
      const result = firstHistoryLecturer.view(university);
      expect(result).to.eql({firstName: "arnold", lastName: "smith", salary: 10});
    });
  });

  describe("modify()", () => {
    const newLecturer = {firstName: "John", lastName: "Doe", salary: 10};

    it("returns a new object with an updated value", () => {
      const result = firstHistoryLecturer.modify(() => newLecturer)(university);
      expect(firstHistoryLecturer.view(result)).to.eql(newLecturer);
    });
  });

  describe("modifyOption()", () => {
    const newLecturer = {firstName: "John", lastName: "Doe", salary: 10};

    it("should only update if option is a Some", () => {
      const result = firstHistoryLecturer.modifyOption(() => Option.of(newLecturer))(university);
      expect(firstHistoryLecturer.view(result.get())).to.eql(newLecturer);
    });

    it("should not update if option is a None", () => {
      const result = firstHistoryLecturer.modifyOption(() => Option.none<Lecturer>())(university);
      expect(result.isPresent).to.be.false;
    })
  });
});
