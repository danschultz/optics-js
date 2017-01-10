import {F1} from "./transformation";
import {Option} from "./option";
import {Traversal, Monoid} from "./traversal";

export class Prism<S, A> {
  constructor(private _getOption: F1<S, Option<A>>, private _reverseGet: F1<A, S>) {}

  public compose<B>(other: Prism<A, B>): Prism<S, B>;
  public compose(other: any): any {
    
  }

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

  public asTraversal(): Traversal<S, A> {
    return new PrismTraversal(this);
  }
}

class PrismTraversal<S, A> extends Traversal<S, A> {
  constructor(private prism: Prism<S, A>) {
    super();
  }

  public foldMap<R>(monoid: Monoid<R, R>, f: F1<A, R>, empty: R): F1<S, R> {
    return s => this.prism.getOption(s).fold(() => empty, (a) => f(a));
  }

  public modify(f: F1<A, A>): F1<S, S> {
    return this.prism.modify(f);
  }

  public modifyOption(f: F1<A, Option<A>>): F1<S, Option<S>> {
    return s => {
      return this.prism
        .getOption(s)
        .flatMap(a => f(a)).map(a => this.prism.set(a)(s));
    };
  }
}
