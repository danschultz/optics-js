export type F<A> = () => A;
export type F1<A, B> = (a: A) => B;
export type F2<A, B, C> = (a: A, b: B) => C;
export type F3<A, B, C, D> = (a: A, b: B, c: C) => D;

export type Predicate<T> = (value: T) => boolean;
