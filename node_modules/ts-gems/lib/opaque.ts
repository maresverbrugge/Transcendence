/**
 * Opaque
 * @desc Create unique type that can't be assigned to base type by accident.
 */
declare namespace Symbols {
  export const base: unique symbol;
  export const brand: unique symbol;
}
export type Opaque<T, N extends string> = T & {
  readonly [Symbols.base]: N;
  readonly [Symbols.brand]: N;
};
