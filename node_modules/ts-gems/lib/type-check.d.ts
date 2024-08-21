import { Primitive, Type } from './types';

type NonObj = Primitive | Function;

/**
 * Returns Y if typeof T is "any", N otherwise
 */
export type IfAny<T, Y = true, N = false> = 0 extends 1 & T ? Y : N;

/**
 * Returns "Y" if "T" is "never", "N" otherwise
 */
export type IfNever<T, Y = true, N = false> = [T] extends [never] ? Y : N;

/**
 * Returns Y if T is undefined, N otherwise
 */
export type IfUndefined<T, Y = true, N = false> = IfEquals<T, undefined, Y, N>;

/**
 * Returns "Y" if "T" is "never", "N" otherwise
 */
export type IfSymbol<T, Y = true, N = false> = IfEquals<T, symbol, Y, N>;

/**
 * Returns Y if typeof T is "unknown", N otherwise
 */
export type IfUnknown<T, Y = true, N = false> = IfEquals<T, unknown, Y, N>;

/**
 * Returns Y if typeof T is null, N otherwise
 */
export type IfNull<T, Y = true, N = false> = IfEquals<T, null, Y, N>;

/**
 * Returns Y if typeof T is null, N otherwise
 */
export type IfNullish<T, Y = true, N = false> =
  IfNever<T> extends true
    ? N
    : T extends null
      ? Y
      : T extends undefined
        ? Y
        : N;

/**
 * Returns Y if typeof T is a tuple, N otherwise
 */
export type IfTuple<T, Y = true, N = false> =
  IfEquals<T, [any]> extends true
    ? T extends [any]
      ? number extends T['length']
        ? N
        : Y
      : N
    : N;
export type IfTupleOrAny<T, Y = true, N = false> =
  IfAny<T> extends true ? Y : IfTuple<T, Y, N>;

/**
 * Returns Y if typeof T is "Primitive", N otherwise
 */
export type IfPrimitive<T, Y = true, N = false> =
  IfNever<T> extends true
    ? N
    : IfNull<T> extends true
      ? Y
      : IfUndefined<T> extends true
        ? Y
        : IfClass<T> extends true
          ? N
          : IfFunction<T> extends true
            ? N
            : T extends Primitive
              ? Y
              : N;

export type IfPrimitiveOrAny<T, Y = true, N = false> =
  IfAny<T> extends true ? Y : IfPrimitive<T, Y, N>;

/**
 * Returns Y if typeof T is an empty object, N otherwise
 */
export type IfEmptyObject<T, Y = true, N = false> = IfEquals<T, {}, Y, N>;

/**
 * Returns Y if typeof T is an object, N otherwise
 */
export type IfObject<T, Y = true, N = false> =
  IfNever<T> extends true
    ? N
    : T extends object
      ? T extends NonObj | any[]
        ? N
        : Y
      : N;

export type IfObjectOrAny<T, Y = true, N = false> =
  IfAny<T> extends true ? Y : IfObject<T, Y, N>;

/**
 * Returns Y if typeof T is an empty object, N otherwise
 */
export type IfFunction<T, Y = true, N = false> =
  IfNever<T> extends true ? N : T extends Type ? N : T extends Function ? Y : N;

export type IfFunctionOrAny<T, Y = true, N = false> =
  IfAny<T> extends true ? Y : IfFunction<T, Y, N>;

/**
 * Returns Y if typeof T is a constructor type, N otherwise
 */
export type IfClass<T, Y = true, N = false> =
  IfNever<T> extends true
    ? N
    : IfUndefined<T> extends true
      ? N
      : T extends Type
        ? Y
        : N;

export type IfClassOrAny<T, Y = true, N = false> =
  IfAny<T> extends true ? Y : IfClass<T, Y, N>;

/**
 * Returns "Y" if "T1" is exactly same with "T2", "N" otherwise
 */
export type IfEquals<T1, T2, Y = true, N = false> =
  | IfObject<T1>
  | IfObject<T2> extends true
  ? (<G>() => G extends EqualsWrapped<T1> ? 1 : 2) extends <
      G,
    >() => G extends EqualsWrapped<T2> ? 1 : 2
    ? Y
    : N
  : (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
    ? Y
    : N;

type EqualsWrapped<T> = T extends infer R & {}
  ? { [P in keyof R]: R[P] }
  : never;

/**
 * Returns "Y" if type "T" matches "U", "N" otherwise
 */
export type IfCompatible<T1, T2, Y = true, N = false> =
  IfUndefined<T1> extends true
    ? IfEquals<T1, T2, Y, N>
    : IfUndefined<T2> extends true
      ? N
      : IfNever<T1> extends true
        ? IfEquals<T1, T2, Y, N>
        : IfNever<T2> extends true
          ? N
          : IfNull<T1> extends true
            ? IfEquals<T1, T2, Y, N>
            : IfNull<T2> extends true
              ? N
              : IfUnknown<T1> extends true
                ? Y
                : IfUnknown<T2> extends true
                  ? Y
                  : IfAny<T1> extends true
                    ? Y
                    : IfAny<T2> extends true
                      ? Y
                      : IfEmptyObject<T1> extends true
                        ? IfObject<T2, Y, N>
                        : IfEmptyObject<T2> extends true
                          ? IfObject<T1, Y, N>
                          : IfFunction<T1> extends true
                            ? IfCompatibleFunction<T1, T2, Y, N>
                            : IfObject<T1> extends true
                              ? [T1] extends [T2]
                                ? Y
                                : N
                              : [T1] extends [T2]
                                ? Y
                                : IfPrimitive<T2> extends true
                                  ? [T2] extends [T1]
                                    ? Y
                                    : N
                                  : N;

type IfCompatibleFunction<T1, T2, Y = true, N = false> =
  IfFunction<T1> extends false
    ? N
    : IfFunction<T2> extends false
      ? N
      : T1 extends T2
        ? Y
        : N;
