import {List, Map} from "immutable";
import {Lens} from "./lens";

export function key<K, V>(key: K): Lens<Map<K, V>, V> {
  return new Lens<Map<K, V>, V>(
      (map) => map.get(key),
      (map, value) => map.set(key, value));
}

export function prop<S, A>(key: string): Lens<S, A> {
  return new Lens<S, A>(
      (obj) => obj[key],
      (obj, value) => Object.assign({}, obj, {[key]: value}));
}

export function index<V>(index: number): Lens<List<V>, V> {
  return new Lens<List<V>, V>(
      (list) => list.get(index),
      (list, value) => list.set(index, value));
}

export function head<V>(): Lens<List<V>, V> {
  return index<V>(0);
}

export function tail<V>(): Lens<List<V>, V> {
  return new Lens<List<V>, V>(
      (list) => list.last(),
      (list, value) => list.set(list.size - 1, value));
}

export function find<V>(predicate: (value?: V, key?: number) => boolean): Lens<List<V>, V> {
  return new Lens<List<V>, V>(
      (list) => list.find(predicate),
      (list, value) => {
        const key = list.findKey(predicate);
        if (key != null) {
          return list.set(key, value);
        } else {
          return list;
        }
      });
}
