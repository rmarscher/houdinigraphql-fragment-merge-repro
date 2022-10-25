import type { AllContent$input, AllContent$result, QueryStore, QueryStoreFetchParams} from '$houdini'

export declare class AllContentStore extends QueryStore<AllContent$result, AllContent$input> {
	constructor() {
		// @ts-ignore
		super({})
	}
}

export const GQL_AllContent: AllContentStore

export declare const load_AllContent: (params: QueryStoreFetchParams<AllContent$result, AllContent$input>) => Promise<{AllContent: AllContentStore}>

export default AllContentStore
