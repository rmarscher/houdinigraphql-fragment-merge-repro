import { getCache } from "$houdini/runtime";
import { executeQuery } from "$houdini/runtime/lib/network";
import { marshalInputs, marshalSelection, unmarshalSelection } from "$houdini/runtime/lib/scalars";
import { writable } from "svelte/store";
import { getCurrentClient } from "../network";
import { getSession } from "../session";
import { BaseStore } from "./store";
class MutationStore extends BaseStore {
  artifact;
  kind = "HoudiniMutation";
  store;
  constructor({ artifact }) {
    super();
    this.artifact = artifact;
    this.store = writable(this.nullState);
  }
  async mutate(variables, {
    metadata,
    fetch,
    ...mutationConfig
  } = {}) {
    const cache = getCache();
    const config = await this.getConfig();
    this.store.update((c) => {
      return { ...c, isFetching: true };
    });
    const layer = cache._internal_unstable.storage.createLayer(true);
    const optimisticResponse = mutationConfig?.optimisticResponse;
    let toNotify = [];
    if (optimisticResponse) {
      toNotify = cache.write({
        selection: this.artifact.selection,
        data: await marshalSelection({
          selection: this.artifact.selection,
          data: optimisticResponse
        }),
        variables,
        layer: layer.id
      });
    }
    const newVariables = await marshalInputs({
      input: variables,
      artifact: this.artifact
    });
    try {
      const { result } = await executeQuery({
        client: await getCurrentClient(),
        config,
        artifact: this.artifact,
        variables: newVariables,
        session: await getSession(),
        cached: false,
        metadata,
        fetch
      });
      if (result.errors && result.errors.length > 0) {
        this.store.update((s) => ({
          ...s,
          errors: result.errors,
          isFetching: false,
          isOptimisticResponse: false,
          data: result.data,
          variables: newVariables || {}
        }));
        throw result.errors;
      }
      layer.clear();
      cache.write({
        selection: this.artifact.selection,
        data: result.data,
        variables: newVariables,
        layer: layer.id,
        notifySubscribers: toNotify,
        forceNotify: true
      });
      cache._internal_unstable.storage.resolveLayer(layer.id);
      const storeData = {
        data: unmarshalSelection(config, this.artifact.selection, result.data),
        errors: result.errors ?? null,
        isFetching: false,
        isOptimisticResponse: false,
        variables: newVariables
      };
      this.store.set(storeData);
      return storeData.data ?? {};
    } catch (error) {
      this.store.update((s) => ({
        ...s,
        errors: error,
        isFetching: false,
        isOptimisticResponse: false,
        data: null,
        variables: newVariables
      }));
      layer.clear();
      cache._internal_unstable.storage.resolveLayer(layer.id);
      throw error;
    }
  }
  subscribe(...args) {
    return this.store.subscribe(...args);
  }
  get nullState() {
    return {
      data: null,
      errors: null,
      isFetching: false,
      isOptimisticResponse: false,
      variables: null
    };
  }
}
export {
  MutationStore
};
