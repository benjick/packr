import dedent from "dedent";
import { Package, org } from "../../packages";

export function generateIndexFile(id: string, config: Package) {
  const idFirstUpper = id.charAt(0).toUpperCase() + id.slice(1);
  const content = dedent(`
  import createClient, { ClientOptions } from "openapi-fetch";
  import type { paths as ${id}Paths } from "./generated";

  export function create${idFirstUpper}Client(clientOptions?: ClientOptions) {
    return createClient<${id}Paths>(clientOptions);
  }`);
  return content;
}

export function generateReadmeFile(id: string, config: Package) {
  const idFirstUpper = id.charAt(0).toUpperCase() + id.slice(1);
  const packageName = `@${org}/${id}`;
  const content = dedent(`
  # ${id}

  This package is generated from the OpenAPI specification at [${config.openapi}](${config.openapi}) using [openapi-typescript](https://github.com/drwpow/openapi-typescript).

  For more information see https://github.com/benjick/packr

  ## Installation
  \`\`\`sh
  npm install ${packageName}
  \`\`\`

  ## Usage
  \`\`\`ts
  import { create${idFirstUpper}Client } from "${packageName}";

  const client = create${idFirstUpper}Client({
    baseUrl: "https://api.example.com",
  });

  async function example() {
    const { data, error, response } = await client.GET("/path");
    console.log(data, error, response.status);
  }

  void example();
  \`\`\`

  ## License
  MIT`);
  return content;
}
