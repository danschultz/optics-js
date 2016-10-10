import {Predicate, F1, F} from "./transformation";

export abstract class Option<A> {
  public static of<A>(value: A | undefined | null): Option<A> {
    if (value == null) {
      return new None<A>();
    } else {
      return new Some(value);
    }
  }

  public static none<A>(): None<A> {
    return new None<A>();
  }

  public abstract get(): A;

  public getOrElse<R>(other: R | F<R>): A | R {
    return this.fold(() => {
      if (typeof other === "function") {
        return (other as Function)();
      } else {
        return other;
      }
    }, value => value);
  }

  public getOrElseThrow(errorProvider?: F<any>): A {
    if (this.isPresent) {
      return this.get();
    } else {
      if (errorProvider) {
        throw errorProvider();
      } else {
        throw new TypeError("Attempt to access value of None");
      }
    }
  }

  public getOrNull(): A | null {
    return this.fold(() => null, value => value);
  }

  public abstract equals(other: any): boolean;

  public filter(f: Predicate<A>): Option<A> {
    if (this.isPresent && f(this.get())) {
      return this;
    } else {
      return new None<A>();
    }
  }

  public flatMap<R>(f: (value: A) => Option<R>): Option<R> {
    return this.fold(() => new None<R>(), value => f(this.get()));
  }

  public fold<N, S>(none: F<N>, some: F1<A, S>): N | S {
    if (this.isPresent) {
      return some(this.get());
    } else {
      return none();
    }
  }

  public invoke(f: (value: A) => void): void {
    if (this.isPresent) {
      f(this.get());
    }
  }

  public map<R>(f: (value: A) => R): Option<R> {
    return this.flatMap(value => Option.of(f(value)));
  }

  public abstract get isPresent(): boolean;
}

class Some<A> extends Option<A> {
  constructor(private value: A) {
    super();
  }

  public equals(other: any): boolean {
    if (other instanceof Some) {
      return this.get() === other.get();
    } else {
      return false;
    }
  }

  public get(): A {
    return this.value;
  }

  public get isPresent(): boolean {
    return true;
  }

  public toString(): string {
    return `Some(${this.get()})`;
  }
}

class None<A> extends Option<A> {
  public get(): A {
    throw new TypeError("Attempt to access value of None");
  }

  public equals(other: any): boolean {
    return other instanceof None;
  }

  public toString(): string {
    return "None()";
  }

  public get isPresent(): boolean {
    return false;
  }
}
