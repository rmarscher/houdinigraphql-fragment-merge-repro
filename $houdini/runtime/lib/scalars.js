import { getCurrentConfig } from "./config";
async function marshalSelection({
  selection,
  data
}) {
  const config = await getCurrentConfig();
  if (data === null || typeof data === "undefined") {
    return data;
  }
  if (Array.isArray(data)) {
    return await Promise.all(data.map((val) => marshalSelection({ selection, data: val })));
  }
  return Object.fromEntries(
    await Promise.all(
      Object.entries(data).map(async ([fieldName, value]) => {
        const { type, fields } = selection[fieldName];
        if (!type) {
          return [fieldName, value];
        }
        if (fields) {
          return [fieldName, await marshalSelection({ selection: fields, data: value })];
        }
        if (config.scalars?.[type]) {
          const marshalFn = config.scalars[type].marshal;
          if (!marshalFn) {
            throw new Error(
              `scalar type ${type} is missing a \`marshal\` function. see https://github.com/AlecAivazis/houdini#%EF%B8%8Fcustom-scalars`
            );
          }
          if (Array.isArray(value)) {
            return [fieldName, value.map(marshalFn)];
          }
          return [fieldName, marshalFn(value)];
        }
        return [fieldName, value];
      })
    )
  );
}
async function marshalInputs({
  artifact,
  input,
  rootType = "@root"
}) {
  const config = await getCurrentConfig();
  if (input === null || typeof input === "undefined") {
    return input;
  }
  if (!artifact.input) {
    return input;
  }
  const fields = rootType === "@root" ? artifact.input.fields : artifact.input.types[rootType];
  if (Array.isArray(input)) {
    return await Promise.all(
      input.map(async (val) => await marshalInputs({ artifact, input: val, rootType }))
    );
  }
  return Object.fromEntries(
    await Promise.all(
      Object.entries(input).map(async ([fieldName, value]) => {
        const type = fields?.[fieldName];
        if (!type) {
          return [fieldName, value];
        }
        const marshalFn = config.scalars?.[type]?.marshal;
        if (marshalFn) {
          if (Array.isArray(value)) {
            return [fieldName, value.map(marshalFn)];
          }
          return [fieldName, marshalFn(value)];
        }
        if (isScalar(config, type) || !artifact.input.types[type]) {
          return [fieldName, value];
        }
        return [fieldName, await marshalInputs({ artifact, input: value, rootType: type })];
      })
    )
  );
}
function unmarshalSelection(config, selection, data) {
  if (data === null || typeof data === "undefined") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((val) => unmarshalSelection(config, selection, val));
  }
  return Object.fromEntries(
    Object.entries(data).map(([fieldName, value]) => {
      const { type, fields } = selection[fieldName];
      if (!type) {
        return [fieldName, value];
      }
      if (fields) {
        return [
          fieldName,
          unmarshalSelection(config, fields, value)
        ];
      }
      if (value === null) {
        return [fieldName, value];
      }
      if (config.scalars?.[type]?.marshal) {
        const unmarshalFn = config.scalars[type].unmarshal;
        if (!unmarshalFn) {
          throw new Error(
            `scalar type ${type} is missing an \`unmarshal\` function. see https://github.com/AlecAivazis/houdini#%EF%B8%8Fcustom-scalars`
          );
        }
        if (Array.isArray(value)) {
          return [fieldName, value.map(unmarshalFn)];
        }
        return [fieldName, unmarshalFn(value)];
      }
      return [fieldName, value];
    })
  );
}
function isScalar(config, type) {
  return ["String", "Boolean", "Float", "ID", "Int"].concat(Object.keys(config.scalars || {})).includes(type);
}
export {
  isScalar,
  marshalInputs,
  marshalSelection,
  unmarshalSelection
};
