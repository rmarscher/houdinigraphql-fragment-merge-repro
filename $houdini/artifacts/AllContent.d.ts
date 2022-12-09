export type AllContent = {
    readonly "input": AllContent$input
    readonly "result": AllContent$result | undefined
};

export type AllContent$result = {
    readonly allContent: ({
        readonly name: string
    } & (({
        readonly images: {
            readonly header: string | null
            readonly footer: string | null
        }
        readonly __typename: "Page"
    }) | ({
        readonly images: {
            readonly header: string | null
            readonly author: string | null
        }
        readonly __typename: "Article"
    })))[]
};

export type AllContent$input = null;