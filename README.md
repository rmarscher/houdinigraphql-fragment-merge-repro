# Houdini Union Query Nested Type Conflict

This is a repro of an error with Houdini GraphQL code generation when selecting fragments on different types
in a union query where those types have fields with
the same name that are not the same type.

example schema:

```graphql
type Article implements Content & Node {
  id: ID!
  images: ArticleImages!
  name: String!
}

type ArticleImages {
  author: String
  header: String
}

interface Content {
  name: String!
}

interface Node {
  id: ID!
}

type Page implements Content & Node {
  id: ID!
  images: PageImages!
  name: String!
}

type PageImages {
  footer: String
  header: String
}

type Query {
  allContent: [Content!]!
  node(id: ID!): Node
}
```


example query:

```graphql
query AllContent {
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
    }
}
```


Houdini outputs an error during codegen:

```
could not merge: PageImages,ArticleImages
```

It seems to be due to a check when building the query selection code
that makes sure that each type is the same.

https://github.com/HoudiniGraphql/houdini/blob/main/packages/houdini/src/codegen/generators/artifacts/utils.ts#L46-L56

I believe the deepMerge call that fails comes from here https://github.com/HoudiniGraphql/houdini/blob/main/packages/houdini/src/codegen/generators/artifacts/selection.ts#L49
