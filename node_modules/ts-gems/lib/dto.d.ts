import { IfNoDeepValue } from './helpers.js';
import { DeepNullish } from './nullish.js';
import { DeepPartial } from './partial.js';
import { IfNever } from './type-check.js';

/**
 * Returns given type as a Data Transfer Object (DTO) interface, Removes symbol keys and function properties.
 * @template T - The type of the data being transferred.
 */
export type DTO<T> = {
  [K in keyof T as IfNever<
    Exclude<T[K], undefined | Function>,
    never,
    K
  >]: Exclude<T[K], undefined | null> extends (infer U)[] // Deep process arrays
    ? DTO<U>[]
    : // Do not deep process No-Deep values
      IfNoDeepValue<Exclude<T[K], undefined | null>> extends true
      ? Exclude<T[K], undefined | null>
      : // Deep process objects
        DTO<Exclude<T[K], undefined | null>>;
};

export type PartialDTO<T> = DeepPartial<DTO<T>>;
export type PatchDTO<T> = DeepNullish<DTO<T>>;
