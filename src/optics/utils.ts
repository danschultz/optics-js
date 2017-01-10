import {F1} from "./transformation";

export function compose<S>(...args: F1<S, S>[]): F1<S, S> {
  return s => {
    return args.reduceRight((accum, f) => f(accum), s);
  };
}
