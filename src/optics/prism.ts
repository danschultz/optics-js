import {F1} from "./transformation";
import {Option} from "./option";

export class Prism<S, A> {
  constructor(private _getOption: F1<S, Option<A>>, private _reverseGet: F1<A, S>) {}

  public getOption(obj: S): Option<A> {
    return this._getOption(obj);
  }

  public isMatching(obj: S): boolean {
    return this.getOption(obj).isPresent;
  }

  public modify(f: (value: A) => A): (obj: S) => S {
    return obj => {
      return this.getOption(obj).fold(
          () => obj,
          value => this.reverseGet(f(value)));
    };
  }

  public modifyOption(f: (value: A) => A): (obj: S) => Option<S> {
    return obj => {
      return this.getOption(obj).map(value => this.modify(f)(obj));
    };
  }

  public reverseGet(value: A): S {
    return this._reverseGet(value);
  }

  public set(value: A): (obj: S) => S {
    return this.modify(() => value);
  }

  public then<B>(other: Prism<A, B>): Prism<S, B> {
    return new Prism<S, B>(
        (obj) => this.getOption(obj).flatMap(value => other.getOption(value)),
        (value) => this.reverseGet(other.reverseGet(value)));
  }
}
