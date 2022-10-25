import type * as Kit from '@sveltejs/kit';
import type { VariableFunction, AfterLoadFunction, BeforeLoadFunction }  from '../../../plugins/houdini-svelte/runtime/types'
import type { PageLoadEvent, PageData as KitPageData } from './$types'


import { AllContent$result, AllContent$input } from '../../../artifacts/AllContent'
	import { AllContentStore } from '../../../plugins/houdini-svelte/stores/AllContent'


type PageParams = PageLoadEvent['params']













export type PageData = {
		AllContent: AllContentStore
}    
