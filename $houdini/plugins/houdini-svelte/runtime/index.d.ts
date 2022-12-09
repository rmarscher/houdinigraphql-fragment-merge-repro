import { QueryStore } from './stores';
export * from './adapter';
export * from './stores';
export * from './fragments';
export * from './session';
declare type LoadResult = Promise<{
    [key: string]: QueryStore<any, {}>;
}>;
declare type LoadAllInput = LoadResult | Record<string, LoadResult>;
declare type ValueOf<T extends Record<PropertyKey, unknown>> = T[keyof T];
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
declare type InferLoadResult<T extends LoadAllInput> = T extends Record<infer Key, infer Res extends LoadResult> ? {
    [K in Key]: ValueOf<Awaited<Res>>;
} : T extends LoadResult ? Awaited<T> : never;
export declare function loadAll<L extends LoadAllInput, Loads extends L[]>(...loads: Loads): Promise<UnionToIntersection<{
    [K in keyof Loads]: InferLoadResult<Loads[K]>;
}[number]>>;
