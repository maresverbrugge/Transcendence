import { Or } from './logical.js';
import { OmitFunctions } from './omit';
import {
  IfAny,
  IfEmptyObject,
  IfFunction,
  IfNever,
  IfUnknown,
} from './type-check';

/**
 * From T, pick a set of properties whose keys are in the union K,
 * while preserving strict type checking.
 */
export type StrictPick<T, X extends keyof T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit X
    K extends X ? false : true
  > extends true
    ? never
    : K]: T[K];
};

/**
 * Pick all function properties in T
 */
export type PickFunctions<T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit non functions
    IfFunction<Exclude<T[K], undefined>, false, true>
  > extends true
    ? never
    : K]: T[K];
};

/**
 * Pick all function properties in T
 */
export type PickTypes<T, X> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit types which not exists in X
    T[K] extends X ? false : X extends T[K] ? false : true
  > extends true
    ? never
    : K]: T[K];
};

/**
 * Pick all function properties in T
 */
export type StrictPickTypes<T, X> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit unknown
    IfUnknown<T[K]>,
    // Omit any
    IfAny<T[K]>,
    // Omit {}
    IfEmptyObject<T[K]>,
    // Omit types which not exists in X
    T[K] extends X ? false : X extends T[K] ? false : true
  > extends true
    ? never
    : K]: T[K];
};

/**
 * @desc Returns Function keys of an object
 */
export type FunctionKeys<T> = keyof PickFunctions<T>;

/**
 * @desc Returns non function keys of an object
 */
export type NonFunctionKeys<T> = keyof OmitFunctions<T>;

/**
 * @desc Returns keys that match given type
 */
export type KeysOfTypes<T, X> = keyof PickTypes<T, X>;

/**
 * @desc Returns keys that equals given type
 */
export type StrictKeysOfTypes<T, X> = keyof StrictPickTypes<T, X>;
