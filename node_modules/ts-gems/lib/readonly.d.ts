import { IfNoDeepValue } from './helpers';
import { Or } from './logical.js';
import { IfEquals, IfNever } from './type-check';

/**
 * Marks given keys as readonly
 */
export type ReadonlySome<T, K extends keyof T> = Readonly<Pick<T, K>> &
  Omit<T, K>;

/**
 * Make all properties in T readonly deeply
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T as IfNever<
    Exclude<T[K], undefined>,
    never,
    K
  >]: IfNoDeepValue<Exclude<T[K], undefined>> extends true // Do not deep process No-Deep values
    ? T[K]
    : // Deep process objects
      DeepReadonly<Exclude<T[K], undefined>>;
};

/**
 * Make all properties in T readonly deeply
 */
export type DeeperReadonly<T> = {
  readonly [K in keyof T as IfNever<
    Exclude<T[K], undefined>,
    never,
    K
  >]: Exclude<T[K], undefined> extends (infer U)[] // Deep process arrays
    ? DeeperReadonly<U>[]
    : // Do not deep process No-Deep values
      IfNoDeepValue<Exclude<T[K], undefined>> extends true
      ? T[K]
      : // Deep process objects
        DeeperReadonly<Exclude<T[K], undefined>>;
};

/**
 * Returns readonly keys of an object
 */
export type ReadonlyKeys<T> = keyof PickReadonly<T>;

/**
 * Pick all readonly properties in T
 */
export type PickReadonly<T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit required
    IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }, false, true>
  > extends true
    ? never
    : K]: T[K];
};

/**
 * Omit all readonly properties in T
 */
export type OmitReadonly<T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit required
    IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }>
  > extends true
    ? never
    : K]: T[K];
};

/**
 * Pick all readonly properties in T deeply
 */
export type DeepPickReadonly<T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit required
    IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }, false, true>
  > extends true
    ? never
    : K]: IfNoDeepValue<Exclude<T[K], undefined>> extends true // Do not deep process No-Deep values
    ? T[K]
    : // Deep process objects
      DeepPickReadonly<Exclude<T[K], undefined>>;
};

/**
 * Pick all readonly properties in T deeply
 */
export type DeepOmitReadonly<T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit required
    IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }>
  > extends true
    ? never
    : K]: IfNoDeepValue<Exclude<T[K], undefined>> extends true // Do not deep process No-Deep values
    ? T[K]
    : // Deep process objects
      DeepOmitReadonly<Exclude<T[K], undefined>>;
};

/**
 * Pick all readonly properties in T deeply including arrays
 */
export type DeeperPickReadonly<T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit required
    IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }, false, true>
  > extends true
    ? never
    : K]: Exclude<T[K], undefined> extends (infer U)[] // Deep process arrays
    ? DeeperPickReadonly<U>[]
    : // Do not deep process No-Deep values
      IfNoDeepValue<Exclude<T[K], undefined>> extends true
      ? T[K]
      : // Deep process objects
        DeeperPickReadonly<Exclude<T[K], undefined>>;
};

/**
 * Pick all readonly properties in T deeply including arrays
 */
export type DeeperOmitReadonly<T> = {
  [K in keyof T as Or<
    // Omit never keys
    IfNever<Exclude<T[K], undefined>>,
    // Omit required
    IfEquals<{ [Q in K]: T[K] }, { readonly [Q in K]: T[K] }>
  > extends true
    ? never
    : K]: Exclude<T[K], undefined> extends (infer U)[] // Deep process arrays
    ? DeeperOmitReadonly<U>[]
    : // Do not deep process No-Deep values
      IfNoDeepValue<Exclude<T[K], undefined>> extends true
      ? T[K]
      : // Deep process objects
        DeeperOmitReadonly<Exclude<T[K], undefined>>;
};
