import { FetchQueryResult } from '$houdini/runtime/lib/types';
import type { LoadEvent } from '@sveltejs/kit';
export declare type QueryInputs<_Data> = FetchQueryResult<_Data> & {
    variables: {
        [key: string]: any;
    };
};
export declare type VariableFunction<_Params extends Record<string, string>, _Input> = (event: LoadEvent<_Params>) => _Input | Promise<_Input>;
export declare type AfterLoadFunction<_Params extends Record<string, string>, _Data, _Input, _ReturnType extends Record<string, any>> = (args: {
    event: LoadEvent<_Params>;
    data: _Data;
    input: _Input;
}) => _ReturnType;
export declare type BeforeLoadFunction<_Params extends Record<string, string>, _ReturnType extends Record<string, any> | void> = (event: LoadEvent<_Params>) => _ReturnType;
export declare type BeforeLoadArgs = LoadEvent;
export declare type AfterLoadArgs = {
    event: LoadEvent;
    input: Record<string, any>;
    data: Record<string, any>;
};
export declare type OnErrorArgs = {
    event: LoadEvent;
    input: Record<string, any>;
};
export declare type KitLoadResponse = {
    status?: number;
    error?: Error;
    redirect?: string;
    props?: Record<string, any>;
    context?: Record<string, any>;
    maxage?: number;
};
