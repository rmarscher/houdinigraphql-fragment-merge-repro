import { test, expect, vi } from "vitest";
import { testConfigFile } from "../../../test";
import { RefetchUpdateMode } from "../../lib/types";
import { Cache } from "../cache";
const config = testConfigFile();
test("prepend linked lists update", function() {
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
          type: "User",
          keyRaw: "friends",
          update: "prepend",
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
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [
          {
            id: "2",
            firstName: "jane"
          },
          {
            id: "3",
            firstName: "mary"
          }
        ]
      }
    },
    applyUpdates: true
  });
  expect(
    cache.read({
      selection: {
        friends: {
          type: "User",
          keyRaw: "friends",
          update: RefetchUpdateMode.prepend,
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
      parent: "User:1"
    }).data
  ).toEqual({
    friends: [
      {
        id: "2",
        firstName: "jane"
      },
      {
        id: "3",
        firstName: "mary"
      }
    ]
  });
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [
          {
            id: "4",
            firstName: "jane"
          },
          {
            id: "5",
            firstName: "mary"
          }
        ]
      }
    },
    applyUpdates: true
  });
  expect(
    cache.read({
      selection: {
        friends: {
          type: "User",
          keyRaw: "friends",
          update: RefetchUpdateMode.prepend,
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
      parent: "User:1"
    }).data
  ).toEqual({
    friends: [
      {
        id: "4",
        firstName: "jane"
      },
      {
        id: "5",
        firstName: "mary"
      },
      {
        id: "2",
        firstName: "jane"
      },
      {
        id: "3",
        firstName: "mary"
      }
    ]
  });
});
test("append in list", function() {
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").append(
    { id: { type: "ID", keyRaw: "id" }, firstName: { type: "String", keyRaw: "firstName" } },
    {
      id: "3",
      firstName: "mary"
    }
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: [
        {
          firstName: "jane",
          id: "2"
        },
        {
          firstName: "mary",
          id: "3"
        }
      ]
    }
  });
});
test("prepend in list", function() {
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").prepend(
    { id: { type: "ID", keyRaw: "id" }, firstName: { type: "String", keyRaw: "firstName" } },
    {
      id: "3",
      firstName: "mary"
    }
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: [
        {
          firstName: "mary",
          id: "3"
        },
        {
          firstName: "jane",
          id: "2"
        }
      ]
    }
  });
});
test("remove from connection", function() {
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
            connection: true,
            type: "User"
          },
          fields: {
            edges: {
              type: "UserEdge",
              keyRaw: "edges",
              fields: {
                node: {
                  type: "Node",
                  keyRaw: "node",
                  abstract: true,
                  fields: {
                    __typename: {
                      type: "String",
                      keyRaw: "__typename"
                    },
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
          }
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        friends: {
          edges: [
            {
              node: {
                __typename: "User",
                id: "2",
                firstName: "jane"
              }
            },
            {
              node: {
                __typename: "User",
                id: "3",
                firstName: "jane"
              }
            }
          ]
        }
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").remove({
    id: "2"
  });
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: {
        edges: [
          {
            node: {
              __typename: "User",
              id: "3",
              firstName: "jane"
            }
          }
        ]
      }
    }
  });
  expect(cache._internal_unstable.subscriptions.get("User:2", "firstName")).toHaveLength(0);
  expect(cache._internal_unstable.subscriptions.get("User:3", "firstName")).toHaveLength(1);
});
test("element removed from list can be added back", function() {
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
            connection: true,
            type: "User"
          },
          fields: {
            edges: {
              type: "UserEdge",
              keyRaw: "edges",
              fields: {
                node: {
                  type: "Node",
                  keyRaw: "node",
                  abstract: true,
                  fields: {
                    __typename: {
                      type: "String",
                      keyRaw: "__typename"
                    },
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
          }
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        friends: {
          edges: [
            {
              node: {
                __typename: "User",
                id: "2",
                firstName: "jane2"
              }
            },
            {
              node: {
                __typename: "User",
                id: "3",
                firstName: "jane"
              }
            }
          ]
        }
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").remove({
    id: "2"
  });
  cache.list("All_Users").append(
    {
      id: {
        keyRaw: "id",
        type: "String"
      },
      firstName: {
        keyRaw: "firstName",
        type: "String"
      }
    },
    {
      __typename: "User",
      id: "2",
      firstName: "jane2"
    },
    {}
  );
  expect(set).toHaveBeenNthCalledWith(2, {
    viewer: {
      id: "1",
      friends: {
        edges: [
          {
            node: {
              __typename: "User",
              id: "3",
              firstName: "jane"
            }
          },
          {
            node: {
              __typename: "User",
              id: "2",
              firstName: "jane2"
            }
          }
        ]
      }
    }
  });
});
test("append in connection", function() {
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
            connection: true,
            type: "User"
          },
          fields: {
            edges: {
              type: "UserEdge",
              keyRaw: "edges",
              fields: {
                node: {
                  type: "Node",
                  keyRaw: "node",
                  abstract: true,
                  fields: {
                    __typename: {
                      type: "String",
                      keyRaw: "__typename"
                    },
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
          }
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        friends: {
          edges: [
            {
              node: {
                __typename: "User",
                id: "2",
                firstName: "jane"
              }
            }
          ]
        }
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").append(
    { id: { type: "ID", keyRaw: "id" }, firstName: { type: "String", keyRaw: "firstName" } },
    {
      id: "3",
      firstName: "mary"
    }
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: {
        edges: [
          {
            node: {
              __typename: "User",
              id: "2",
              firstName: "jane"
            }
          },
          {
            node: {
              __typename: "User",
              id: "3",
              firstName: "mary"
            }
          }
        ]
      }
    }
  });
});
test("inserting data with an update overwrites a record inserted with list.append", function() {
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
            connection: true,
            type: "User"
          },
          fields: {
            edges: {
              type: "UserEdge",
              keyRaw: "edges",
              fields: {
                node: {
                  type: "Node",
                  keyRaw: "node",
                  abstract: true,
                  fields: {
                    __typename: {
                      type: "String",
                      keyRaw: "__typename"
                    },
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
          }
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        friends: {
          edges: [
            {
              node: {
                __typename: "User",
                id: "2",
                firstName: "jane"
              }
            }
          ]
        }
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").append(
    { id: { type: "ID", keyRaw: "id" }, firstName: { type: "String", keyRaw: "firstName" } },
    {
      id: "3",
      firstName: "mary"
    }
  );
  cache.write({
    applyUpdates: true,
    data: {
      viewer: {
        id: "1",
        firstName: "John",
        friends: {
          edges: [
            {
              cursor: "1234",
              node: {
                __typename: "User",
                id: "3",
                firstName: "mary"
              }
            }
          ]
        }
      }
    },
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
          },
          friends: {
            type: "User",
            keyRaw: "friends",
            fields: {
              edges: {
                type: "UserEdge",
                keyRaw: "edges",
                update: "append",
                fields: {
                  cursor: {
                    type: "String",
                    keyRaw: "cursor"
                  },
                  node: {
                    type: "User",
                    keyRaw: "node",
                    fields: {
                      __typename: {
                        type: "String",
                        keyRaw: "__typename"
                      },
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
            }
          }
        }
      }
    }
  });
  expect(set).toHaveBeenNthCalledWith(2, {
    viewer: {
      id: "1",
      friends: {
        edges: [
          {
            node: {
              __typename: "User",
              id: "2",
              firstName: "jane"
            }
          },
          {
            node: {
              __typename: "User",
              id: "3",
              firstName: "mary"
            }
          }
        ]
      }
    }
  });
});
test("list filter - must_not positive", function() {
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
          filters: {
            foo: {
              kind: "String",
              value: "bar"
            }
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").when({ must_not: { foo: "not-bar" } }).prepend(
    {
      id: { type: "ID", keyRaw: "id" },
      firstName: { type: "String", keyRaw: "firstName" }
    },
    {
      id: "3",
      firstName: "mary"
    }
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: [
        {
          firstName: "mary",
          id: "3"
        },
        {
          firstName: "jane",
          id: "2"
        }
      ]
    }
  });
});
test("list filter - must_not negative", function() {
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
          filters: {
            foo: {
              kind: "String",
              value: "bar"
            }
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").when({ must_not: { foo: "bar" } }).prepend(
    {
      id: { type: "ID", keyRaw: "id" },
      firstName: { type: "String", keyRaw: "firstName" }
    },
    {
      id: "3",
      firstName: "mary"
    }
  );
  expect(set).not.toHaveBeenCalled();
});
test("list filter - must positive", function() {
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
          filters: {
            foo: {
              kind: "String",
              value: "bar"
            }
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").when({ must: { foo: "bar" } }).prepend(
    {
      id: { type: "ID", keyRaw: "id" },
      firstName: { type: "String", keyRaw: "firstName" }
    },
    {
      id: "3",
      firstName: "mary"
    }
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: [
        {
          firstName: "mary",
          id: "3"
        },
        {
          firstName: "jane",
          id: "2"
        }
      ]
    }
  });
});
test("list filter - must negative", function() {
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
          filters: {
            foo: {
              kind: "String",
              value: "bar"
            }
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").when({ must: { foo: "not-bar" } }).prepend(
    {
      id: { type: "ID", keyRaw: "id" },
      firstName: { type: "String", keyRaw: "firstName" }
    },
    {
      id: "3",
      firstName: "mary"
    }
  );
  expect(set).not.toHaveBeenCalled();
});
test("remove from list", function() {
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Users").remove({
    id: "2"
  });
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: []
    }
  });
  expect(cache._internal_unstable.subscriptions.get("User:2", "firstName")).toHaveLength(0);
});
test("delete node", function() {
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
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "jane"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.delete(
    cache._internal_unstable.id("User", {
      id: "2"
    })
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: []
    }
  });
  expect(cache._internal_unstable.storage.topLayer.operations["User:2"].deleted).toBeTruthy();
});
test("delete node from connection", function() {
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
            connection: true,
            type: "User"
          },
          fields: {
            edges: {
              type: "UserEdge",
              keyRaw: "edges",
              fields: {
                node: {
                  type: "Node",
                  keyRaw: "node",
                  abstract: true,
                  fields: {
                    __typename: {
                      type: "String",
                      keyRaw: "__typename"
                    },
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
          }
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        friends: {
          edges: [
            {
              node: {
                __typename: "User",
                id: "2",
                firstName: "jane"
              }
            }
          ]
        }
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.delete(
    cache._internal_unstable.id("User", {
      id: "2"
    })
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      friends: {
        edges: []
      }
    }
  });
  expect(cache._internal_unstable.storage.topLayer.operations["User:2"].deleted).toBeTruthy();
});
test("append operation", function() {
  const cache = new Cache(config);
  cache.write({
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
    data: {
      viewer: {
        id: "1"
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      newUser: {
        type: "User",
        keyRaw: "newUser",
        operations: [
          {
            action: "insert",
            list: "All_Users",
            parentID: {
              kind: "String",
              value: cache._internal_unstable.id("User", "1")
            }
          }
        ],
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    data: {
      newUser: {
        id: "3"
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(1);
});
test("append from list", function() {
  const cache = new Cache(config);
  cache.write({
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
    data: {
      viewer: {
        id: "1"
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      newUser: {
        type: "User",
        keyRaw: "newUser",
        operations: [
          {
            action: "insert",
            list: "All_Users",
            parentID: {
              kind: "String",
              value: cache._internal_unstable.id("User", "1")
            }
          }
        ],
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    data: {
      newUser: [{ id: "3" }, { id: "4" }]
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(2);
});
test("toggle list", function() {
  const cache = new Cache(config);
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
    },
    data: {
      viewer: {
        id: "1",
        friends: [{ id: "5" }]
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  const toggleSelection = {
    newUser: {
      type: "User",
      keyRaw: "newUser",
      operations: [
        {
          action: "toggle",
          list: "All_Users",
          parentID: {
            kind: "String",
            value: cache._internal_unstable.id("User", "1")
          }
        }
      ],
      fields: {
        id: {
          type: "ID",
          keyRaw: "id"
        }
      }
    }
  };
  cache.write({ selection: toggleSelection, data: { newUser: { id: "3" } } });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toEqual([
    "User:5",
    "User:3"
  ]);
  cache.write({ selection: toggleSelection, data: { newUser: { id: "3" } } });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toEqual([
    "User:5"
  ]);
  cache.write({ selection: toggleSelection, data: { newUser: { id: "3" } } });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toEqual([
    "User:5",
    "User:3"
  ]);
});
test("append when operation", function() {
  const cache = new Cache(config);
  cache.write({
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
    data: {
      viewer: {
        id: "1"
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
        friends: {
          type: "User",
          keyRaw: "friends",
          list: {
            name: "All_Users",
            connection: false,
            type: "User"
          },
          filters: {
            value: {
              kind: "String",
              value: "foo"
            }
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      newUser: {
        type: "User",
        keyRaw: "newUser",
        operations: [
          {
            action: "insert",
            list: "All_Users",
            parentID: {
              kind: "String",
              value: cache._internal_unstable.id("User", "1")
            },
            when: {
              must: {
                value: "not-foo"
              }
            }
          }
        ],
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    data: {
      newUser: {
        id: "3"
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(0);
});
test("prepend when operation", function() {
  const cache = new Cache(config);
  cache.write({
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
    data: {
      viewer: {
        id: "1"
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
        friends: {
          type: "User",
          keyRaw: "friends",
          list: {
            name: "All_Users",
            connection: false,
            type: "User"
          },
          filters: {
            value: {
              kind: "String",
              value: "foo"
            }
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      newUser: {
        type: "User",
        keyRaw: "newUser",
        operations: [
          {
            action: "insert",
            list: "All_Users",
            parentID: {
              kind: "String",
              value: cache._internal_unstable.id("User", "1")
            },
            position: "first",
            when: {
              must: {
                value: "not-foo"
              }
            }
          }
        ],
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    data: {
      newUser: {
        id: "3"
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(0);
});
test("prepend operation", function() {
  const cache = new Cache(config);
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
          friends: {
            type: "User",
            keyRaw: "friends",
            fields: {
              id: {
                type: "String",
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
    },
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "mary"
          }
        ]
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      newUser: {
        type: "User",
        keyRaw: "newUser",
        operations: [
          {
            action: "insert",
            list: "All_Users",
            parentID: {
              kind: "String",
              value: cache._internal_unstable.id("User", "1")
            },
            position: "first"
          }
        ],
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    data: {
      newUser: {
        id: "3"
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toEqual([
    "User:3",
    "User:2"
  ]);
});
test("remove operation", function() {
  const cache = new Cache(config);
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
          friends: {
            type: "User",
            keyRaw: "friends",
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
    },
    data: {
      viewer: {
        id: "1",
        friends: [{ id: "2", firstName: "jane" }]
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      newUser: {
        type: "User",
        keyRaw: "newUser",
        operations: [
          {
            action: "remove",
            list: "All_Users",
            parentID: {
              kind: "String",
              value: cache._internal_unstable.id("User", "1")
            }
          }
        ],
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    data: {
      newUser: {
        id: "2"
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(0);
});
test("remove operation from list", function() {
  const cache = new Cache(config);
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
          friends: {
            type: "User",
            keyRaw: "friends",
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
    },
    data: {
      viewer: {
        id: "1",
        friends: [
          { id: "2", firstName: "jane" },
          { id: "3", firstName: "Alfred" }
        ]
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      newUser: {
        type: "User",
        keyRaw: "newUser",
        operations: [
          {
            action: "remove",
            list: "All_Users",
            parentID: {
              kind: "String",
              value: cache._internal_unstable.id("User", "1")
            }
          }
        ],
        fields: {
          id: {
            type: "ID",
            keyRaw: "id"
          }
        }
      }
    },
    data: {
      newUser: [{ id: "2" }, { id: "3" }]
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(0);
});
test("delete operation", function() {
  const cache = new Cache(config);
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
          friends: {
            type: "User",
            keyRaw: "friends",
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
    },
    data: {
      viewer: {
        id: "1",
        friends: [{ id: "2", firstName: "jane" }]
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      deleteUser: {
        type: "User",
        keyRaw: "deleteUser",
        fields: {
          id: {
            type: "ID",
            keyRaw: "id",
            operations: [
              {
                action: "delete",
                type: "User"
              }
            ]
          }
        }
      }
    },
    data: {
      deleteUser: {
        id: "2"
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(0);
  expect(cache._internal_unstable.storage.topLayer.operations["User:2"].deleted).toBeTruthy();
});
test("delete operation from list", function() {
  const cache = new Cache(config);
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
          friends: {
            type: "User",
            keyRaw: "friends",
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
    },
    data: {
      viewer: {
        id: "1",
        friends: [
          { id: "2", firstName: "jane" },
          { id: "3", firstName: "Alfred" }
        ]
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
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
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      deleteUser: {
        type: "User",
        keyRaw: "deleteUser",
        fields: {
          id: {
            type: "ID",
            keyRaw: "id",
            operations: [
              {
                action: "delete",
                type: "User"
              }
            ]
          }
        }
      }
    },
    data: {
      deleteUser: {
        id: ["2", "3"]
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(0);
  expect(cache._internal_unstable.storage.topLayer.operations["User:2"].deleted).toBeTruthy();
  expect(cache._internal_unstable.storage.topLayer.operations["User:3"].deleted).toBeTruthy();
});
test("delete operation from connection", function() {
  const cache = new Cache(config);
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
          friends: {
            type: "User",
            keyRaw: "friends",
            list: {
              name: "All_Users",
              connection: true,
              type: "User"
            },
            fields: {
              edges: {
                type: "UserEdge",
                keyRaw: "edges",
                fields: {
                  node: {
                    type: "Node",
                    keyRaw: "node",
                    abstract: true,
                    fields: {
                      __typename: {
                        type: "String",
                        keyRaw: "__typename"
                      },
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
            }
          }
        }
      }
    },
    data: {
      viewer: {
        id: "1",
        friends: {
          edges: [{ node: { id: "2", firstName: "jane", __typename: "User" } }]
        }
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: {
        friends: {
          type: "User",
          keyRaw: "friends",
          list: {
            name: "All_Users",
            connection: true,
            type: "User"
          },
          fields: {
            edges: {
              type: "UserEdge",
              keyRaw: "edges",
              fields: {
                node: {
                  type: "Node",
                  keyRaw: "node",
                  abstract: true,
                  fields: {
                    __typename: {
                      type: "String",
                      keyRaw: "__typename"
                    },
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
          }
        }
      },
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.write({
    selection: {
      deleteUser: {
        type: "User",
        keyRaw: "deleteUser",
        fields: {
          id: {
            type: "ID",
            keyRaw: "id",
            operations: [
              {
                action: "delete",
                type: "User"
              }
            ]
          }
        }
      }
    },
    data: {
      deleteUser: {
        id: "2"
      }
    }
  });
  expect([...cache.list("All_Users", cache._internal_unstable.id("User", "1"))]).toHaveLength(0);
  expect(cache._internal_unstable.storage.topLayer.operations["User:2"].deleted).toBeTruthy();
});
test("disabled linked lists update", function() {
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
          type: "User",
          keyRaw: "friends",
          update: "append",
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
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [
          {
            id: "2",
            firstName: "jane"
          },
          {
            id: "3",
            firstName: "mary"
          }
        ]
      }
    }
  });
  expect(
    cache.read({
      selection: { friends: selection.viewer.fields.friends },
      parent: "User:1"
    }).data
  ).toEqual({
    friends: [
      {
        id: "2",
        firstName: "jane"
      },
      {
        id: "3",
        firstName: "mary"
      }
    ]
  });
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [
          {
            id: "3",
            firstName: "jane"
          },
          {
            id: "4",
            firstName: "mary"
          }
        ]
      }
    }
  });
  expect(
    cache.read({
      selection: { friends: selection.viewer.fields.friends },
      parent: "User:1"
    }).data
  ).toEqual({
    friends: [
      {
        id: "3",
        firstName: "jane"
      },
      {
        id: "4",
        firstName: "mary"
      }
    ]
  });
});
test("append linked lists update", function() {
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
          type: "User",
          keyRaw: "friends",
          update: "append",
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
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [
          {
            id: "2",
            firstName: "jane"
          },
          {
            id: "3",
            firstName: "mary"
          }
        ]
      }
    }
  });
  expect(
    cache.read({
      selection: { friends: selection.viewer.fields.friends },
      parent: "User:1"
    }).data
  ).toEqual({
    friends: [
      {
        id: "2",
        firstName: "jane"
      },
      {
        id: "3",
        firstName: "mary"
      }
    ]
  });
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        firstName: "bob",
        friends: [
          {
            id: "4",
            firstName: "jane"
          },
          {
            id: "5",
            firstName: "mary"
          }
        ]
      }
    },
    applyUpdates: true
  });
  expect(
    cache.read({
      selection: { friends: selection.viewer.fields.friends },
      parent: "User:1"
    }).data
  ).toEqual({
    friends: [
      {
        id: "2",
        firstName: "jane"
      },
      {
        id: "3",
        firstName: "mary"
      },
      {
        id: "4",
        firstName: "jane"
      },
      {
        id: "5",
        firstName: "mary"
      }
    ]
  });
});
test("writing a scalar marked with a disabled update overwrites", function() {
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
  expect(cache.read({ selection }).data).toEqual({
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
  expect(cache.read({ selection }).data).toEqual({
    viewer: {
      id: "1",
      firstName: "bob",
      friends: [2]
    }
  });
});
test("writing a scalar marked with a prepend", function() {
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
          update: "prepend"
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
  expect(cache.read({ selection }).data).toEqual({
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
    },
    applyUpdates: true
  });
  expect(cache.read({ selection }).data).toEqual({
    viewer: {
      id: "1",
      firstName: "bob",
      friends: [2, 1]
    }
  });
});
test("writing a scalar marked with an append", function() {
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
  expect(cache.read({ selection }).data).toEqual({
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
    },
    applyUpdates: true
  });
  expect(cache.read({ selection }).data).toEqual({
    viewer: {
      id: "1",
      firstName: "bob",
      friends: [1, 2]
    }
  });
});
test("list operations fail silently", function() {
  const cache = new Cache(config);
  expect(
    () => cache.write({
      selection: {
        newUser: {
          type: "User",
          keyRaw: "newUser",
          operations: [
            {
              action: "insert",
              list: "All_Users",
              parentID: {
                kind: "String",
                value: cache._internal_unstable.id("User", "1")
              }
            }
          ],
          fields: {
            id: {
              type: "ID",
              keyRaw: "id"
            }
          }
        }
      },
      data: {
        newUser: {
          id: "3"
        }
      }
    })
  ).not.toThrow();
});
test("when conditions look for all matching lists", function() {
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
          keyRaw: "friends(filter: true, foo: $var)",
          list: {
            name: "All_Users",
            connection: false,
            type: "User"
          },
          filters: {
            foo: {
              kind: "Variable",
              value: "var"
            },
            filter: {
              kind: "Boolean",
              value: true
            }
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
  cache.write({
    selection,
    variables: {
      var: "world"
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
      var: "world"
    }
  );
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
  cache.list("All_Users").when({ must: { filter: true } }).append(
    {
      id: { type: "ID", keyRaw: "id" },
      firstName: { type: "String", keyRaw: "firstName" }
    },
    {
      id: "3",
      firstName: "mathew"
    },
    {
      var: "hello"
    }
  );
  expect(cache.read({ selection, variables: { var: "world" } }).data).toEqual({
    viewer: {
      friends: [
        {
          firstName: "yves",
          id: "2"
        },
        {
          firstName: "mathew",
          id: "3"
        }
      ],
      id: "1"
    }
  });
});
test("parentID must be passed if there are multiple instances of a list handler", function() {
  const cache = new Cache(config);
  const friendsSelection = {
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
  };
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
          ...friendsSelection
        }
      }
    },
    data: {
      viewer: {
        id: "1",
        friends: [
          {
            id: "2",
            firstName: "Jean"
          }
        ]
      }
    }
  });
  cache.subscribe(
    {
      rootType: "User",
      selection: friendsSelection,
      parentID: cache._internal_unstable.id("User", "1"),
      set: vi.fn()
    },
    {}
  );
  cache.subscribe(
    {
      rootType: "User",
      selection: friendsSelection,
      parentID: cache._internal_unstable.id("User", "2"),
      set: vi.fn()
    },
    {}
  );
  expect(() => cache.list("All_Users")).toThrow();
  expect(cache.list("All_Users", "1").lists[0].recordID).toEqual(
    cache._internal_unstable.id("User", "1")
  );
});
test("append in abstract list", function() {
  const cache = new Cache(config);
  const selection = {
    viewer: {
      type: "Node",
      keyRaw: "viewer",
      fields: {
        id: {
          type: "ID",
          keyRaw: "id"
        },
        __typename: {
          type: "String",
          keyRaw: "__typename"
        },
        friends: {
          type: "Node",
          keyRaw: "friends",
          list: {
            name: "All_Nodes",
            connection: false,
            type: "Node"
          },
          fields: {
            id: {
              type: "ID",
              keyRaw: "id"
            },
            firstName: {
              type: "String",
              keyRaw: "firstName"
            },
            __typename: {
              type: "String",
              keyRaw: "__typename"
            }
          }
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        __typename: "User",
        friends: [
          {
            id: "2",
            firstName: "jane",
            __typename: "User"
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("All_Nodes").append(
    { id: { type: "ID", keyRaw: "id" }, firstName: { type: "String", keyRaw: "firstName" } },
    {
      id: "3",
      firstName: "mary",
      __typename: "User"
    }
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      __typename: "User",
      friends: [
        {
          firstName: "jane",
          id: "2",
          __typename: "User"
        },
        {
          firstName: "mary",
          id: "3",
          __typename: "User"
        }
      ]
    }
  });
});
test("list operations on interface fields without a well defined parent update the correct values in cache", function() {
  const cache = new Cache(config);
  const selection = {
    viewer: {
      type: "Node",
      keyRaw: "viewer",
      fields: {
        id: {
          type: "ID",
          keyRaw: "id"
        },
        __typename: {
          type: "String",
          keyRaw: "__typename"
        },
        friends: {
          type: "Node",
          keyRaw: "friends",
          abstract: true,
          fields: {
            id: {
              type: "ID",
              keyRaw: "id"
            },
            __typename: {
              type: "String",
              keyRaw: "__typename"
            },
            notFriends: {
              type: "Node",
              keyRaw: "notFriends",
              abstract: true,
              list: {
                name: "Not_Friends",
                connection: false,
                type: "Node"
              },
              fields: {
                id: {
                  type: "ID",
                  keyRaw: "id"
                },
                firstName: {
                  type: "String",
                  keyRaw: "firstName"
                },
                __typename: {
                  type: "String",
                  keyRaw: "__typename"
                }
              }
            }
          }
        }
      }
    }
  };
  cache.write({
    selection,
    data: {
      viewer: {
        id: "1",
        __typename: "User",
        friends: [
          {
            id: "2",
            __typename: "User",
            notFriends: [
              {
                id: "3",
                firstName: "jane",
                __typename: "User"
              }
            ]
          },
          {
            id: "3",
            __typename: "User",
            notFriends: [
              {
                id: "4",
                firstName: "jane",
                __typename: "User"
              }
            ]
          }
        ]
      }
    }
  });
  const set = vi.fn();
  cache.subscribe({
    rootType: "Query",
    set,
    selection
  });
  cache.list("Not_Friends", "3").append(
    {
      id: {
        type: "ID",
        keyRaw: "id"
      },
      firstName: {
        type: "String",
        keyRaw: "firstName"
      },
      __typename: {
        type: "String",
        keyRaw: "__typename"
      }
    },
    {
      id: "5",
      firstName: "Billy",
      __typename: "User"
    }
  );
  expect(set).toHaveBeenCalledWith({
    viewer: {
      id: "1",
      __typename: "User",
      friends: [
        {
          id: "2",
          __typename: "User",
          notFriends: [
            {
              id: "3",
              firstName: "jane",
              __typename: "User"
            }
          ]
        },
        {
          id: "3",
          __typename: "User",
          notFriends: [
            {
              id: "4",
              firstName: "jane",
              __typename: "User"
            },
            {
              id: "5",
              firstName: "Billy",
              __typename: "User"
            }
          ]
        }
      ]
    }
  });
});
