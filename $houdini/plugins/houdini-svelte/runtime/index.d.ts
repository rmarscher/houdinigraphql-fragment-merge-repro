import { QueryStore } from './stores';
export * from './adapter';
export * from './stores';
export * from './fragments';
export * from './session';
declare type LoadResult = Promise<{
    [key: string]: QueryStore<any, {}>;
}>;
declare type LoadAllInput = LoadResult | Record<string, LoadResult>;
export declare function loadAll(...loads: LoadAllInput[]): Promise<Record<string, QueryStore<any, {}>>>;
