import {List, Map, Iterable} from "immutable";
import {Lens} from "./lens";
import {Optional, BlockOptional} from "./optional";
import {Option} from "./option";
import {F1} from "./transformation";

export function key<K, V>(key: K): Lens<Map<K, V>, V> {
  return new Lens<Map<K, V>, V>(
      (map) => map.get(key),
      (map, value) => map.set(key, value));
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

export function findInList<V>(predicate: (value: V, key: number) => boolean): Lens<List<V>, Option<V>> {
  return new Lens<List<V>, Option<V>>(
      (list) => Option.of(list.find(predicate)),
      (list, value) => {
        const key = list.findKey(predicate);
        return value.fold(
          () => key != null ? list.remove(key) : list,
          (value) => key != null ? list.set(key, value) : list
        );
      }
  );
}

export function at<K, V>(key: K): Lens<Map<K, V>, Option<V>> {
  return new Lens<Map<K, V>, Option<V>>(
      (map) => Option.of(map.get(key)),
      (map, value) => {
        return value.fold(() => map.delete(key), value => map.set(key, value))
      }
  );
}

export function appendToList<V>(values: Iterable<number, V>): F1<List<V>, List<V>> {
  return list => list.concat(values).toList();
}
