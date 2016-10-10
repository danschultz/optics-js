import {Option} from "./option";
import {F1} from "./transformation";
import {Traversal, Monoid} from "./traversal";

export abstract class Optional<S, A> {
  public composeOptional<B>(other: Optional<A, B>): Optional<S, B> {
    return new ComposedOptional(this, other);
  }

  public modify(f: F1<A, A>): F1<S, S> {
    // TODO(dan): should this use viewOrModify() which returns an Either?
    // Seems like this is fine, since none will just return the original.
    return s => this.viewOption(s).fold(() => s, a => this.set(f(a))(s));
  }

  public modifyOption(f: F1<A, Option<A>>): F1<S, Option<S>> {
    return s => this.viewOption(s)
        .flatMap(a => f(a))
        .map(a => this.set(a)(s));
  }

  public asTraversal(): Traversal<S, A> {
    return new OptionalTraversal(this);
  }

  public abstract set(a: A): F1<S, S>;

  public abstract viewOption(obj: S): Option<A>;
}

class ComposedOptional<S, A, B> extends Optional<S, B> {
  constructor(private a: Optional<S, A>, private b: Optional<A, B>) {
    super();
  }

  public set(a: B): F1<S, S> {
    return this.a.modify(this.b.set(a));
  }

  public viewOption(obj: S): Option<B> {
    return this.a.viewOption(obj).flatMap(this.b.viewOption);
  }
}

class OptionalTraversal<S, A> extends Traversal<S, A> {
  constructor(private optional: Optional<S, A>) {
    super();
  }

  public foldMap<R>(monoid: Monoid<R, R>, f: F1<A, R>, empty: R): F1<S, R> {
    return s => {
      return this.optional.viewOption(s).fold(() => empty, (a => f(a)));
    };
  }

  public modify(f: F1<A, A>): F1<S, S> {
    return this.optional.modify(f);
  }

  public modifyOption(f: F1<A, Option<A>>): F1<S, Option<S>> {
    return this.optional.modifyOption(f);
  }
}
