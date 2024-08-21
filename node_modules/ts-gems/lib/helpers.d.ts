import { IfAny, IfClass, IfTuple } from './type-check';
import { Builtin } from './types';

/**
 * Returns true if T is excluded from deep operations
 */
export type IfNoDeepValue<T> = T extends Builtin
  ? true
  : IfAny<T> extends true
    ? T
    : IfTuple<T> extends true
      ? true
      : T extends Function
        ? true
        : IfClass<T> extends true
          ? true
          : T extends Map<any, any>
            ? true
            : T extends ReadonlyMap<any, any>
              ? true
              : T extends WeakMap<any, any>
                ? true
                : T extends Set<any>
                  ? true
                  : T extends ReadonlySet<any>
                    ? true
                    : T extends WeakSet<any>
                      ? true
                      : T extends any[]
                        ? true
                        : false;

/**
 * ValuesOf
 * @desc Returns the union type of all the values in a type
 */
export type ValuesOf<T> = T[keyof T];
