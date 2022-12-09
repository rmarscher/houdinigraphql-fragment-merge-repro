export default {
    name: "AllContent",
    kind: "HoudiniQuery",
    hash: "4d64b5a27bd572ea4d532add332b29d2489ca7d2c269b9e1bb6c36c61d0191f1",

    raw: `query AllContent {
  allContent {
    name
    ... on Page {
      images {
        header
        footer
      }
    }
    ... on Article {
      images {
        header
        author
      }
    }
    __typename
  }
}`,

    rootType: "Query",

    selection: {
        fields: {
            allContent: {
                type: "Content",
                keyRaw: "allContent",

                selection: {
                    abstractFields: {
                        fields: {
                            Page: {
                                images: {
                                    type: "PageImages",
                                    keyRaw: "images",

                                    selection: {
                                        fields: {
                                            header: {
                                                type: "String",
                                                keyRaw: "header",
                                                nullable: true
                                            },

                                            footer: {
                                                type: "String",
                                                keyRaw: "footer",
                                                nullable: true
                                            }
                                        }
                                    }
                                },

                                name: {
                                    type: "String",
                                    keyRaw: "name"
                                },

                                __typename: {
                                    type: "String",
                                    keyRaw: "__typename"
                                }
                            },

                            Article: {
                                images: {
                                    type: "ArticleImages",
                                    keyRaw: "images",

                                    selection: {
                                        fields: {
                                            header: {
                                                type: "String",
                                                keyRaw: "header",
                                                nullable: true
                                            },

                                            author: {
                                                type: "String",
                                                keyRaw: "author",
                                                nullable: true
                                            }
                                        }
                                    }
                                },

                                name: {
                                    type: "String",
                                    keyRaw: "name"
                                },

                                __typename: {
                                    type: "String",
                                    keyRaw: "__typename"
                                }
                            }
                        },

                        typeMap: {}
                    },

                    fields: {
                        name: {
                            type: "String",
                            keyRaw: "name"
                        },

                        __typename: {
                            type: "String",
                            keyRaw: "__typename"
                        }
                    }
                },

                abstract: true
            }
        }
    },

    policy: "CacheOrNetwork",
    partial: false
};

"HoudiniHash=c68bb5fe4d89c03e1eef162cfc2be33cb7cc668002012408887c0bc089b1da07";