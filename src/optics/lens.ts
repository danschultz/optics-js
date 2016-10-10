import {F1, F2} from "./transformation";
import {Traversal, Monoid} from "./traversal";
import {Optional} from "./optional";
import {Option} from "./option";

export class Lens<S, A> {
  private readonly getter: F1<S, A>;
  private readonly setter: F2<S, A, S>;

  constructor(getter: F1<S, A>, setter: F2<S, A, S>) {
    this.getter = getter;
    this.setter = setter;
  }

  public composeOptional<B>(other: Optional<A, B>): Optional<S, B> {
    return this.asOptional().composeOptional(other);
  }

  public composeTraversal<B>(other: Traversal<A, B>): Traversal<S, B> {
    return this.asTraversal().composeTraversal(other);
  }

  public modify(f: F1<A, A>): F1<S, S> {
    return s => this.set(f(this.view(s)))(s);
  }

  public modifyOption(f: F1<A, Option<A>>): F1<S, Option<S>> {
    return s => f(this.view(s)).map(a => this.set(a)(s));
  }

  public set(value: A): F1<S, S> {
    return obj => this.setter(obj, value);
  }

  public then<B>(lens: Lens<A, B>): Lens<S, B> {
    return compose(this, lens);
  }

  public view(obj: S): A {
    return this.getter(obj);
  }

  public asTraversal(): Traversal<S, A> {
    return new LensTraversal(this);
  }

  public asOptional(): Optional<S, A> {
    return new LensOptional(this);
  }
}

// Dan: Making this private for now, since you can compose lenses using Lens.then()
function compose<A, B, C>(a: Lens<A, B>, b: Lens<B, C>): Lens<A, C>;
function compose(...lenses: Lens<any, any>[]): Lens<any, any> {
  return lenses.reduce((accumulated, lens) => {
    return new Lens(
        (obj) => {
          const nextObj = accumulated.view(obj);
          return lens.view(nextObj);
        },
        (obj, value) => {
          const parent = accumulated.view(obj);
          const newParent = lens.set(value)(parent);
          return accumulated.set(newParent)(obj);
        }
    );
  });
}

class LensTraversal<S, A> extends Traversal<S, A> {
  constructor(private lens: Lens<S, A>) {
    super();
  }

  public foldMap<R>(monoid: Monoid<R, R>, f: F1<A, R>, empty: R): F1<S, R> {
    return s => f(this.lens.view(s));
  }

  public modify(f: F1<A, A>): F1<S, S> {
    return this.lens.modify(f);
  }

  public modifyOption(f: F1<A, Option<A>>): F1<S, Option<S>> {
    return this.lens.modifyOption(f);
  }
}

class LensOptional<S, A> extends Optional<S, A> {
  constructor(private lens: Lens<S, A>) {
    super();
  }

  public set(a: A): F1<S, S> {
    return this.lens.set(a);
  }

  public viewOption(obj: S): Option<A> {
    return Option.of(this.lens.view(obj));
  }
}
