import { IfNoDeepValue } from './helpers';
import { IfNever } from './type-check';

/**
 * OmitNever<T> is a type that omits all properties with a value of type "never".
 *
 * @template T - The original type
 *
 * @example
 * type MyType = {
 *   a: string;
 *   b: number;
 *   c?: never;
 * };
 *
 * type Result = OmitNever<MyType>;
 * // Result is:
 * // {
 * //   a: string;
 * //   b: number;
 * // }
 */
export type OmitNever<T> = {
  [K in keyof T as IfNever<Exclude<T[K], undefined>, never, K>]: T[K];
};

/**
 * Omit all "never" and "undefined" properties in T deeply
 */
export type DeepOmitNever<T> = {
  [K in keyof T as IfNever<Exclude<T[K], undefined>, never, K>]: IfNoDeepValue<
    // Do not deep process No-Deep values
    Exclude<T[K], undefined>
  > extends true
    ? T[K]
    : // Deep process objects
      DeepOmitNever<Exclude<T[K], undefined>>;
};

/**
 * Omit all "never" and "undefined" properties in T deeply including arrays
 */
export type DeeperOmitNever<T> = {
  [K in keyof T as IfNever<Exclude<T[K], undefined>, never, K>]: Exclude<
    // Deep process arrays
    T[K],
    undefined
  > extends (infer U)[]
    ? DeeperOmitNever<U>[]
    : // Do not deep process No-Deep values
      IfNoDeepValue<Exclude<T[K], undefined>> extends true
      ? T[K]
      : // Deep process objects
        DeepOmitNever<Exclude<T[K], undefined>>;
};
