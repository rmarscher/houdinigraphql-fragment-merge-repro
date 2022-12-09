import { MutationArtifact, QueryArtifact, SubscriptionArtifact } from '$houdini/runtime/lib/types';
import { LoadEvent, RequestEvent } from '@sveltejs/kit';
import { GraphQLError } from 'graphql';
import { AfterLoadArgs, BeforeLoadArgs, OnErrorArgs } from './types';
declare const sessionKeyName = "__houdini__session__";
export declare class RequestContext {
    private loadEvent;
    continue: boolean;
    returnValue: {};
    constructor(ctx: LoadEvent);
    error(status: number, message: string | Error): any;
    redirect(status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308, location: string): any;
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
    graphqlErrors(payload: {
        errors?: GraphQLError[];
    }): any;
    invokeLoadHook({ variant, hookFn, input, data, error, }: {
        variant: 'before' | 'after' | 'error';
        hookFn: KitBeforeLoad | KitAfterLoad | KitOnError;
        input: Record<string, any>;
        data: Record<string, any>;
        error: unknown;
    }): Promise<void>;
    computeInput({ variableFunction, artifact, }: {
        variableFunction: KitBeforeLoad;
        artifact: QueryArtifact | MutationArtifact | SubscriptionArtifact;
    }): Promise<{} | null | undefined>;
}
declare type KitBeforeLoad = (ctx: BeforeLoadArgs) => Record<string, any> | Promise<Record<string, any>>;
declare type KitAfterLoad = (ctx: AfterLoadArgs) => Record<string, any>;
declare type KitOnError = (ctx: OnErrorArgs) => Record<string, any>;
export declare function extractSession(val: {
    [sessionKeyName]: App.Session;
}): App.Session;
export declare function buildSessionObject(event: RequestEvent): {
    __houdini__session__: App.Session;
};
export declare function setClientSession(val: App.Session): void;
export declare function getClientSession(): App.Session;
export declare function setSession(event: RequestEvent, session: App.Session): void;
export declare function getSession(event?: RequestEvent | LoadEvent): Promise<{} | App.Session>;
export {};
