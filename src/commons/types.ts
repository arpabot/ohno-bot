export type NonNullableByKey<T, K extends keyof T, T2> = Omit<T, K> & {
  [K2 in K]: T2;
};
