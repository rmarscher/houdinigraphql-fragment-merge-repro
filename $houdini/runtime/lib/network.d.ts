/// <reference path="../../../../../houdini.d.ts" />
import type { ConfigFile } from './config';
import { CachePolicy, GraphQLObject, MutationArtifact, QueryArtifact, FetchQueryResult, RequestPayload, RequestPayloadMagic } from './types';
export declare class HoudiniClient {
    private fetchFn;
    socket: SubscriptionHandler | null | undefined;
    constructor(networkFn: RequestHandler<any>, subscriptionHandler?: SubscriptionHandler | null);
    sendRequest<_Data>(ctx: FetchContext, params: FetchParams): Promise<RequestPayloadMagic<_Data>>;
}
export declare class Environment extends HoudiniClient {
    constructor(...args: ConstructorParameters<typeof HoudiniClient>);
}
export declare type SubscriptionHandler = {
    subscribe: (payload: {
        query: string;
        variables?: {};
    }, handlers: {
        next: (payload: {
            data?: {};
            errors?: readonly {
                message: string;
            }[];
        }) => void;
        error: (data: {}) => void;
        complete: () => void;
    }) => () => void;
};
export declare type FetchParams = {
    text: string;
    hash: string;
    variables: {
        [key: string]: any;
    };
};
export declare type FetchContext = {
    fetch: typeof window.fetch;
    metadata?: App.Metadata | null;
    session: App.Session | null;
};
/**
 * ## Tip 👇
 *
 * To define types for your metadata, create a file `src/app.d.ts` containing the followingI:
 *
 * ```ts
 * declare namespace App { *
 * 	interface Metadata {}
 * }
 * ```
 *
 */
export declare type RequestHandlerArgs = FetchContext & FetchParams & {
    session?: App.Session;
};
export declare type RequestHandler<_Data> = (args: RequestHandlerArgs) => Promise<RequestPayload<_Data>>;
export declare function executeQuery<_Data extends GraphQLObject, _Input extends {}>({ client, artifact, variables, session, cached, fetch, metadata, }: {
    client: HoudiniClient;
    artifact: QueryArtifact | MutationArtifact;
    variables: _Input;
    session: any;
    cached: boolean;
    config: ConfigFile;
    fetch?: typeof globalThis.fetch;
    metadata?: {};
}): Promise<{
    result: RequestPayload;
    partial: boolean;
}>;
export declare function fetchQuery<_Data extends GraphQLObject, _Input extends {}>({ client, artifact, variables, cached, policy, context, }: {
    client: HoudiniClient;
    context: FetchContext;
    artifact: QueryArtifact | MutationArtifact;
    variables: _Input;
    cached?: boolean;
    policy?: CachePolicy;
}): Promise<FetchQueryResult<_Data>>;
