declare module "putil-varhelpers" {

    type Maybe<T> = T | undefined;

    export function coalesce(...args: any[]): any;

    export function toArray<T = any>(v: any): Maybe<T[]>;

    export function toArrayDef<T = any>(v: any, defaultValue: T[]): T[];

    export function toString(v: any): Maybe<string>;

    export function toStringDef(v: any, defaultValue: string): string;

    export function toBoolean(v: any): Maybe<boolean>;

    export function toBooleanDef(v: any, defaultValue: boolean): boolean;

    export function toNumber(v: number | string | null | undefined): Maybe<number>;

    export function toNumberDef(v: number | string | null | undefined, defaultValue: number): number;

    export function toInt(v: number | string | null | undefined): Maybe<number>;

    export function toIntDef(v: number | string | null | undefined, defaultValue: number): number;

    export function toDate(value: Date | String | null | undefined): Maybe<Date>;

    export function toDateDef(value: Date | String | null | undefined, defaultValue: Date): Date;

    export function parseDate(value: String,
                              options?: {
                                  dateOnly?: boolean;
                                  ignoreTimezone?: boolean;
                              }): Date;

    export function camelCase(v: string): string;

    export function pascalCase(v: string): string;

    export function upperFirst(v: string): string;

    export function mapDistinct<T = any>(a: T[], coercer?: (v: any) => T): T[];

    // Deprecated methods
    export function coerceToArray<T = any>(v: any): Maybe<T[]>;
    export function coerceToArray<T = any>(v: any, defaultValue: T[]): T[];

    export function coerceToString(v: any): Maybe<string>;
    export function coerceToString(v: any, defaultValue: string): string;

    export function coerceToBoolean(v: any): Maybe<boolean>;
    export function coerceToBoolean(v: any, defaultValue: boolean): boolean;

    export function coerceToNumber(v: any): Maybe<number>;
    export function coerceToNumber(v: any, defaultValue: number): number;

    export function coerceToInt(v: any): Maybe<number>;
    export function coerceToInt(v: any, defaultValue: number): number;

    export function coerceToDate(value: Date | String | null | undefined): Maybe<Date>;
    export function coerceToDate(value: Date | String | null | undefined, defaultValue: Date): Date;


}
