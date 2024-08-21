import { IfNever } from './type-check';

export type And<T1, T2, T3 = true, T4 = true, T5 = true, T6 = true> =
  IfNever<Exclude<T1, undefined | null | false>> extends true
    ? false
    : IfNever<Exclude<T2, undefined | null | false>> extends true
      ? false
      : IfNever<Exclude<T3, undefined | null | false>> extends true
        ? false
        : IfNever<Exclude<T4, undefined | null | false>> extends true
          ? false
          : IfNever<Exclude<T5, undefined | null | false>> extends true
            ? false
            : IfNever<Exclude<T6, undefined | null | false>> extends true
              ? false
              : true;

export type Or<T1, T2, T3 = false, T4 = false, T5 = false, T6 = false> =
  IfNever<Exclude<T1, undefined | null | false>> extends false
    ? true
    : IfNever<Exclude<T2, undefined | null | false>> extends false
      ? true
      : IfNever<Exclude<T3, undefined | null | false>> extends false
        ? true
        : IfNever<Exclude<T4, undefined | null | false>> extends false
          ? true
          : IfNever<Exclude<T5, undefined | null | false>> extends false
            ? true
            : IfNever<Exclude<T6, undefined | null | false>> extends false
              ? true
              : false;
