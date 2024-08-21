// noinspection JSUnusedGlobalSymbols

import { DeeperMutable, DeepMutable, Mutable } from './mutable';
import { DeeperPartial, DeepPartial } from './partial';
import { DeeperReadonly, DeepReadonly } from './readonly';
import { DeeperRequired, DeepRequired } from './required';

export * from './combine';
export * from './dto';
export * from './helpers';
export * from './logical';
export * from './mutable';
export * from './nullish';
export * from './omit';
export * from './omit-never';
export * from './opaque';
export * from './partial';
export * from './pick';
export * from './readonly';
export * from './required';
export * from './type-check';
export * from './types';

declare function asMutable<T>(x: T): Mutable<T>;

declare function asDeepMutable<T>(x: T): DeepMutable<T>;

declare function asDeeperMutable<T>(x: T): DeeperMutable<T>;

declare function asReadonly<T>(x: T): Readonly<T>;

declare function asDeepReadonly<T>(x: T): DeepReadonly<T>;

declare function asDeeperReadonly<T>(x: T): DeeperReadonly<T>;

declare function asPartial<T>(x: T): Partial<T>;

declare function asDeepPartial<T>(x: T): DeepPartial<T>;

declare function asDeeperPartial<T>(x: T): DeeperPartial<T>;

declare function asRequired<T>(x: T): Required<T>;

declare function asDeepRequired<T>(x: T): DeepRequired<T>;

declare function asDeeperRequired<T>(x: T): DeeperRequired<T>;

export {
  asDeeperMutable,
  asDeeperPartial,
  asDeeperReadonly,
  asDeeperRequired,
  asDeepMutable,
  asDeepPartial,
  asDeepReadonly,
  asDeepRequired,
  asMutable,
  asPartial,
  asReadonly,
  asRequired,
};
