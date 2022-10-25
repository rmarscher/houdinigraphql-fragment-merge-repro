import { QueryStore } from '../runtime/stores'
import artifact from '$houdini/artifacts/AllContent'

// create the query store

export class AllContentStore extends QueryStore {
	constructor() {
		super({
			artifact,
			storeName: "AllContentStore",
			variables: false,
		})
	}
}

export async function load_AllContent(params) {
	const store = new AllContentStore()

	await store.fetch(params)

	return {
		AllContent: store,
	}
}

export const GQL_AllContent = new AllContentStore()

export default GQL_AllContent
