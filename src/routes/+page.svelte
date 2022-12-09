<script>
  import { graphql } from '$houdini';

	const AllContent = graphql`
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
	`;

  // Using an alias can work around the problem...
  // but all of the code that references that field by name
  // needs to then also be changed.
  //
  // const AllContent = graphql`
	// 	query AllContent {
	// 		allContent {
  //       name
  //       ... on Page {
  //         images {
  //           header
  //           footer
  //         }
  //       }
  //       ... on Article {
  //         articleImages: images {
  //           header
  //           author
  //         }
  //       }
	// 		}
	// 	}
	// `;
</script>

{#if $AllContent.data?.allContent}
  <h1>Content</h1>
  <ul>
    {#each $AllContent.data?.allContent as content}
      <li>{content.name} - images: {JSON.stringify(content.images)}</li>
    {/each}
  </ul>
{/if}
