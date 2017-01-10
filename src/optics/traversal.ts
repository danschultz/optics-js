import {F1, Predicate} from "./transformation";
import {Option} from "./option";
import {List, Map} from "immutable";
import {Lens} from "./lens";
import {Optional} from "./optional";
import {Prism} from "./prism";

export type Monoid<A, R> = (accum: R, next: A) => R;

export abstract class Traversal<S, A> {
  public all(predicate: Predicate<A>): F1<S, boolean> {
    return this.foldMap((a, b) => a && b, predicate, false);
  }

  public composeLens<B>(lens: Lens<A, B>): Traversal<S, B> {
    return this.composeTraversal(lens.asTraversal());
  }

  public composeOptional<B>(optional: Optional<A, B>): Traversal<S, B> {
    return this.composeTraversal(optional.asTraversal());
  }

  public composePrism<B>(prism: Prism<A, B>): Traversal<S, B> {
    return this.composeTraversal(prism.asTraversal());
  }

  public composeTraversal<B>(other: Traversal<A, B>): Traversal<S, B> {
    return new ComposedTraversal(this, other);
  }

  public exist(predicate: Predicate<A>): F1<S, boolean> {
    return this.foldMap((a, b) => a || b, predicate, false);
  }

  public find(predicate: Predicate<A>): F1<S, Option<A>> {
    return this.foldMap<Option<A>>(
        (a, b) => a.isPresent ? a : b,
        a => predicate(a) ? Option.of<A>(a) : Option.none<A>(),
        Option.none<A>());
  }

  public abstract foldMap<R>(monoid: Monoid<R, R>, f: F1<A, R>, empty: R): F1<S, R>;

  public getAll(obj: S): A[] {
    return this.foldMap<A[]>((a, b) => a.concat(b), a => [a], [])(obj);
  }

  public abstract modify(f: F1<A, A>): F1<S, S>;

  public abstract modifyOption(f: F1<A, Option<A>>): F1<S, Option<S>>;

  public set(a: A): F1<S, S> {
    return this.modify(_ => a);
  }
}

class ComposedTraversal<S, A, B> extends Traversal<S, B> {
  constructor(private a: Traversal<S, A>, private b: Traversal<A, B>) {
    super();
  }

  public foldMap<R>(monoid: Monoid<R, R>, f: F1<B, R>, empty: R): F1<S, R> {
    return this.a.foldMap(monoid, this.b.foldMap(monoid, f, empty), empty);
  }

  public modify(f: F1<B, B>): F1<S, S> {
    return this.a.modify(this.b.modify(f));
  }

  public modifyOption(f: F1<B, Option<B>>): F1<S, Option<S>> {
    return this.a.modifyOption(this.b.modifyOption(f));
  }
}

export class ListTraversal<A> extends Traversal<List<A>, A> {
  public foldMap<R>(monoid: Monoid<R, R>, f: F1<A, R>, empty: R): F1<List<A>, R> {
    return list => {
      if (!list.isEmpty()) {
        return list.skip(1).reduce((accum, next) => monoid(accum!, f(next!)), f(list.first()));
      } else {
        return empty;
      }
    };
  }

  public modify(f: F1<A, A>): F1<List<A>, List<A>> {
    return list => list.map(f).toList();
  }

  public modifyOption(f: F1<A, Option<A>>): F1<List<A>, Option<List<A>>> {
    return list => Option.of(list.map(a => f(a!).getOrElse(a!)).toList());
  }
}

export class MapTraversal<K, A> extends Traversal<Map<K, A>, A> {
  public foldMap<R>(monoid: Monoid<R, R>, f: F1<A, R>, empty: R): F1<Map<K, A>, R> {
    return map => {
      const entries = map.entrySeq();
      if (!map.isEmpty()) {
        return entries.skip(1).reduce((accum, entry) => monoid(accum!, f(entry![1])), f(entries.first()[1]));
      } else {
        return empty;
      }
    };
  }

  public modify(f: F1<A, A>): F1<Map<K, A>, Map<K, A>> {
    return map => map.map(f).toMap();
  }

  public modifyOption(f: F1<A, Option<A>>): F1<Map<K, A>, Option<Map<K, A>>> {
    return map => Option.of(map.map(a => f(a!).getOrElse(a!)).toMap());
  }
}
