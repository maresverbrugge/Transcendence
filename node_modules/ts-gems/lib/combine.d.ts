/**
 * Merges types without merging types of properties.
 */
export type Combine<T1, T2, T3 = {}, T4 = {}> = T1 &
  Omit<T2, keyof T1> &
  Omit<T3, keyof T1 | keyof T2> &
  Omit<T4, keyof T1 | keyof T2 | keyof T3>;
