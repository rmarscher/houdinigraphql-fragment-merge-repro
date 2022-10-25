import { test, expect } from "vitest";
import { testConfigFile } from "../../../test";
import { Cache, rootID } from "../cache";
const config = testConfigFile({
  scalars: {
    DateTime: {
      type: "Date",
      marshal(val) {
        return val.getTime();
      },
      unmarshal(val) {
        return new Date(val);
      }
    }
  }
});
test("extracting data with custom scalars unmarshals the value", () => {
  const cache = new Cache(config);
  const selection = {
    node: {
      type: "Node",
      keyRaw: "node",
      fields: {
        date: {
          type: "DateTime",
          keyRaw: "date"
        },
        id: {
          type: "ID",
          keyRaw: "id"
        }
      }
    }
  };
  const data = {
    node: {
      id: "1",
      date: new Date().getTime()
    }
  };
  cache.write({ selection, data });
  expect(cache.read({ parent: rootID, selection }).data).toEqual({
    node: {
      id: "1",
      date: new Date(data.node.date)
    }
  });
});
test("can store and retrieve lists of lists of scalars", function() {
  const cache = new Cache(config);
  const selection = {
    viewer: {
      type: "User",
      keyRaw: "viewer",
      fields: {
        id: {
          type: "ID",
          keyRaw: "id"
        },
        strings: {
          type: "String",
          keyRaw: "strings"
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        strings: ["bob", "john"]
      }
    }
  });
  expect(cache.read({ parent: rootID, selection }).data).toEqual({
    viewer: {
      id: "1",
      strings: ["bob", "john"]
    }
  });
});
test("can write list of scalars", function() {
  const cache = new Cache(config);
  const selection = {
    viewer: {
      type: "User",
      keyRaw: "viewer",
      fields: {
        id: {
          type: "ID",
          keyRaw: "id"
        },
        firstName: {
          type: "String",
          keyRaw: "firstName"
        },
        friends: {
          type: "Int",
          keyRaw: "friends"
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [1]
      }
    }
  });
  expect(cache.read({ parent: rootID, selection }).data).toEqual({
    viewer: {
      id: "1",
      firstName: "bob",
      friends: [1]
    }
  });
});
test("writing a scalar marked with replace", function() {
  const cache = new Cache(config);
  const selection = {
    viewer: {
      type: "User",
      keyRaw: "viewer",
      fields: {
        id: {
          type: "ID",
          keyRaw: "id"
        },
        firstName: {
          type: "String",
          keyRaw: "firstName"
        },
        friends: {
          type: "Int",
          keyRaw: "friends",
          update: "append"
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [1]
      }
    }
  });
  expect(cache.read({ parent: rootID, selection }).data).toEqual({
    viewer: {
      id: "1",
      firstName: "bob",
      friends: [1]
    }
  });
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [2]
      }
    }
  });
  expect(cache.read({ parent: rootID, selection }).data).toEqual({
    viewer: {
      id: "1",
      firstName: "bob",
      friends: [2]
    }
  });
});
