import { test, vi, expect } from "vitest";
import { testConfigFile } from "../../../test";
import { Cache } from "../cache";
const config = testConfigFile();
config.cacheBufferSize = 10;
test("adequate ticks of garbage collector clear unsubscribed data", function() {
  const cache = new Cache(config);
  const userFields = {
    id: {
      type: "ID",
      keyRaw: "id"
    },
    firstName: {
      type: "String",
      keyRaw: "firstName"
    }
  };
  cache.write({
    selection: {
      viewer: {
        type: "User",
        keyRaw: "viewer",
        fields: userFields
      }
    },
    data: {
      viewer: {
        id: "1",
        firstName: "bob"
      }
    }
  });
  for (const _ of Array.from({ length: config.cacheBufferSize })) {
    cache._internal_unstable.collectGarbage();
    expect(cache.read({ selection: userFields, parent: "User:1" })).toMatchObject({
      data: { id: "1" }
    });
  }
  cache._internal_unstable.collectGarbage();
  expect(cache.read({ selection: userFields, parent: "User:1" })).toMatchObject({
    data: null
  });
});
test("subscribed data shouldn't be garbage collected", function() {
  const cache = new Cache(testConfigFile());
  cache.write({
    selection: {
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
          }
        }
      }
    },
    data: {
      viewer: {
        id: "1",
        firstName: "bob"
      }
    }
  });
  cache.subscribe({
    rootType: "Query",
    selection: {
      viewer: {
        type: "User",
        keyRaw: "viewer",
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    set: vi.fn()
  });
  for (const _ of Array.from({ length: config.cacheBufferSize + 1 })) {
    cache._internal_unstable.collectGarbage();
  }
  expect(
    cache.read({
      selection: {
        id: {
          type: "ID",
          keyRaw: "id"
        }
      },
      parent: "User:1"
    }).data
  ).toEqual({ id: "1" });
});
test("resubscribing to fields marked for garbage collection resets counter", function() {
  const cache = new Cache(testConfigFile());
  cache.write({
    selection: {
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
          }
        }
      }
    },
    data: {
      viewer: {
        id: "1",
        firstName: "bob"
      }
    }
  });
  for (const _ of Array.from({ length: 3 })) {
    cache._internal_unstable.collectGarbage();
  }
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    selection: {
      viewer: {
        type: "User",
        keyRaw: "viewer",
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    set
  });
  for (const _ of Array.from({ length: config.cacheBufferSize })) {
    cache._internal_unstable.collectGarbage();
  }
  cache.unsubscribe({
    rootType: "Query",
    selection: {
      viewer: {
        type: "User",
        keyRaw: "viewer",
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    set
  });
  for (const _ of Array.from({ length: config.cacheBufferSize })) {
    cache._internal_unstable.collectGarbage();
  }
  expect(
    cache.read({
      selection: {
        id: {
          type: "ID",
          keyRaw: "id"
        }
      },
      parent: "User:1"
    }).data
  ).toEqual({ id: "1" });
  cache._internal_unstable.collectGarbage();
  expect(
    cache.read({
      selection: {
        id: {
          type: "ID",
          keyRaw: "id"
        }
      },
      parent: "User:1"
    })
  ).toMatchObject({
    data: null
  });
});
test("ticks of gc delete list handlers", function() {
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
        friends: {
          type: "User",
          keyRaw: "friends",
          list: {
            name: "All_Users",
            connection: false,
            type: "User"
          },
          fields: {
            id: {
              type: "ID",
              keyRaw: "id"
            },
            firstName: {
              type: "String",
              keyRaw: "firstName"
            }
          }
        }
      }
    }
  };
  cache.write({
    selection,
    variables: {
      var: "hello"
    },
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "yves"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe(
    {
      rootType: "Query",
      set,
      selection
    },
    {
      var: "hello"
    }
  );
  cache.unsubscribe(
    {
      rootType: "Query",
      set,
      selection
    },
    {
      var: "hello"
    }
  );
  for (const _ of Array.from({ length: config.cacheBufferSize + 1 })) {
    cache._internal_unstable.collectGarbage();
  }
  expect(cache._internal_unstable.lists.get("All_Users")).toBeNull();
});
