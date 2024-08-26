/**
 * Declare ReadableStream and WritableStream in case dom.d.ts is not added to the tsconfig
 * lib causing ReadableStream or WritableStream interface is not defined.
 * For developers with dom.d.ts added, the ReadableStream and WritableStream
 * interface will be merged correctly.
 *
 * This is also required for any clients with streaming interface where ReadableStream
 * or WritableStream type is also referred.
 */
declare global {
  export interface ReadableStream<R = any> {
    readonly locked: boolean;

    cancel(reason?: any): Promise<void>;

    getReader(options: { mode: 'byob' }): ReadableStreamBYOBReader;

    getReader(): ReadableStreamDefaultReader<R>;

    getReader(
      options?: ReadableStreamGetReaderOptions,
    ): ReadableStreamReader<R>;
  }

  export interface WritableStream<W = any> {
    readonly locked: boolean;

    abort(reason?: any): Promise<void>;

    getWriter(): WritableStreamDefaultWriter<W>;
  }
}

/**
 * BasicPrimitive
 * @desc Type representing
 * [`BasicPrimitive`](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html#smarter-type-alias-preservation)
 * types in TypeScript
 */
type BasicPrimitive = number | string | boolean;

/**
 * Primitive
 * @desc Type representing [`Primitive`](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) types
 * in TypeScript: `string | number | bigint | boolean |  symbol | null | undefined`
 */
export type Primitive = BasicPrimitive | null | bigint | symbol | undefined;

/**
 * JsonTypes
 * @desc Type representing JSON types in TypeScript
 */
type JsonType = BasicPrimitive | null | object | (BasicPrimitive | object)[];

/**
 * Builtin
 * @desc Type representing Builtin types in JavaScript
 */
export type Builtin =
  | Primitive
  | Function
  | String
  | Number
  | Date
  | Error
  | RegExp
  | Buffer
  | ArrayBuffer
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | URL
  | ReadableStream
  | WritableStream;

/**
 * Type
 * @desc Represents constructor of type T
 */
export interface Type<T = any> {
  new (...args: any[]): T;
}

/**
 * Class
 * @desc Represents Class constructor of type T
 */
export type Class<
  Args extends any[] = any[],
  Instance = {},
  Static = {},
> = (new (...args: Args) => Instance) & Static;

/**
 * Maybe
 * @desc Type representing T | undefined
 */
export type Maybe<T> = T | undefined;

/**
 * Nullish
 * @desc Type representing T | undefined | null
 */
export type Nullish<T = null> = T | undefined | null;

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type Thunk<T> = T | (() => T);
export type ThunkAsync<T> = Thunk<T> | (() => Promise<T>);
export type TypeThunk<T = any> = Thunk<Type<T>>;
export type TypeThunkAsync<T = any> = ThunkAsync<Type<T>>;

export type MaybePromise<T> = T | Promise<T>;

/**
 * PropertyType
 * @desc Returns the type of property at a given key `K`
 */
export type PropertyType<T, K extends keyof T> = T[K];

/**
 * $ElementType
 * @desc Returns the type of elements inside of array, tuple or object of type `T`, that matches the given index type `K`
 */
export type ElementType<
  T extends { [P in K & any]: any },
  K extends keyof T | number,
> = T[K];
