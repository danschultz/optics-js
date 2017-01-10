import {Option} from "./option";
import {Prism} from "./prism";
import {Lens} from "./lens";

export function some<A>(): Prism<Option<A>, A> {
  return new Prism<Option<A>, A>(
    (s) => s,
    (a) => Option.of(a)
  );
}

export function prop<S, A>(key: string): Lens<S, A> {
  return new Lens<S, A>(
      (obj) => obj[key],
      (obj, value) => Object.assign({}, obj, {[key]: value}));
}
