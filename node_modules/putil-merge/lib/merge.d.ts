export as namespace mergeLib;

export = merge;

declare function merge(target: object, source: object, options?: merge.IMergeOptions): object;

declare namespace merge {

  interface ArrayMergeCallback {
    (trgVal: any, srcVal: any): any[];
  }

  interface FilterCallback {
    (source: object, key: string): any;
  }

  export interface IMergeOptions {
    deep?: boolean | ((v: any) => boolean);
    clone?: boolean;
    combine?: boolean;
    /**
     * Copies field descriptors
     */
    descriptor?: boolean;
    filter?: FilterCallback;
    arrayMerge?: boolean | ArrayMergeCallback;
    /**
     * Copy fields which values are "undefined"
     */
    copyUndefined?: boolean;
  }

  export function all(object: Array<object>, options?: IMergeOptions): object;

  export function arrayCombine(target: any, source: Array<any>): Array<any>;

}
