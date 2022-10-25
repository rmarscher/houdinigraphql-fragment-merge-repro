export default {
    name: "AllContent",
    kind: "HoudiniQuery",
    hash: "4d0368550bb45221a3169a4c8e5e965fe4adc6abc9dd42b47e97746941ea1df2",

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
      articleImages: images {
        header
        author
      }
    }
    __typename
  }
}`,

    rootType: "Query",

    selection: {
        allContent: {
            type: "Content",
            keyRaw: "allContent",

            fields: {
                name: {
                    type: "String",
                    keyRaw: "name"
                },

                images: {
                    type: "PageImages",
                    keyRaw: "images",

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
                },

                articleImages: {
                    type: "ArticleImages",
                    keyRaw: "articleImages",

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
                },

                __typename: {
                    type: "String",
                    keyRaw: "__typename"
                }
            },

            abstract: true
        }
    },

    policy: "CacheOrNetwork",
    partial: false
};

"HoudiniHash=de3c0b0ed1427954f9b2d00e76de8c2bf36a985622b5e8cd8c4f927d4f0afd28";