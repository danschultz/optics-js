import {List, Map} from "immutable";
import {prop} from "../src/optics";
import {MapTraversal, ListTraversal} from "../src/optics/traversal";
import {Optional} from "../src/optics/optional";
import {F1, Predicate} from "../src/optics/transformation";
import {Option} from "../src/optics/option";

export type Lecturer = {firstName: string, lastName: string, salary: number};
export type Department = {budget: number, lecturers: List<Lecturer>};
export type University = {name: string, departments: Map<string, Department>};

export const university: University = {
  name: "Iowa State",
  departments: Map({
    "Computer Science": {
      budget: 100,
      lecturers: List([
          {firstName: "john", lastName: "doe", salary: 10},
          {firstName: "robert", lastName: "johnson", salary: 15},
      ])
    },
    "History": {
      budget: 50,
      lecturers: List([
        {firstName: "arnold", lastName: "smith", salary: 10},
      ])
    }
  })
};

export const name = prop<University, string>("name");
export const departments = prop<University, Map<string, Department>>("departments");
export const lecturers = prop<Department, List<Lecturer>>("lecturers");

export const allDepartments = departments.compose(new MapTraversal<string, Department>());

export const firstName = prop<Lecturer, string>("firstName");
export const lastName = prop<Lecturer, string>("lastName");

export class LessThanOptional<S, A> extends Optional<S, A> {
  constructor(private field: string, private num: number) {
    super();
  }

  public set(a: A): F1<S, S> {
    return s => this.viewOption(s).fold(() => s, () => {
      return Object.assign({}, s, {[this.field]: a});
    });
  }

  public viewOption(obj: S): Option<A> {
    return Option.of(obj && obj[this.field]).filter(value => value < this.num);
  }
}
