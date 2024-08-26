import { IfNoDeepValue } from './helpers';
import {
  DeeperOmitRequired,
  DeeperPickRequired,
  DeepOmitRequired,
  DeepPickRequired,
  OmitRequired,
  PickRequired,
} from './required';
import { IfNever } from './type-check';

/**
 * Marks given keys as optional
 */
export type PartialSome<T, K extends keyof T> = Partial<Pick<T, K>> &
  Omit<T, K>;

/**
 * Partial but deeply
 */
export type DeepPartial<T> = {
  [K in keyof T as IfNever<Exclude<T[K], undefined>, never, K>]?: IfNoDeepValue<
    // Do not deep process No-Deep values
    Exclude<T[K], undefined>
  > extends true
    ? T[K]
    : // Deep process objects
      DeepPartial<Exclude<T[K], undefined>>;
};

/**
 * Partial but deeply including arrays
 */
export type DeeperPartial<T> = {
  [K in keyof T as IfNever<Exclude<T[K], undefined>, never, K>]?: Exclude<
    // Deep process arrays
    T[K],
    undefined
  > extends (infer U)[]
    ? DeeperPartial<U>[]
    : // Do not deep process No-Deep values
      IfNoDeepValue<Exclude<T[K], undefined>> extends true
      ? T[K]
      : // Deep process objects
        DeeperPartial<Exclude<T[K], undefined>>;
};

/**
 * OptionalKeys
 * @desc Returns optional keys of an object
 */
export type OptionalKeys<T> = keyof PickOptional<T>;

/**
 * Pick all optional properties in T
 */
export type PickOptional<T> = OmitRequired<T>;

/**
 * Omit all optional properties in T
 */
export type OmitOptional<T> = PickRequired<T>;

/**
 * Pick all optional properties in T deeply
 */
export type DeepPickOptional<T> = DeepOmitRequired<T>;

/**
 * Omit all optional properties in T deeply
 */
export type DeepOmitOptional<T> = DeepPickRequired<T>;

/**
 * Pick all optional properties in T deeply including arrays
 */
export type DeeperPickOptional<T> = DeeperOmitRequired<T>;

/**
 * Omit all optional properties in T deeply including arrays
 */
export type DeeperOmitOptional<T> = DeeperPickRequired<T>;
