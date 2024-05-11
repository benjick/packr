export interface Package {
  openapi: `${string}.json` | `${string}.yml` | `${string}.yaml`;
}

export const org = "packr";

export const packages: Record<string, Package> = {
  radarr: {
    openapi:
      "https://raw.githubusercontent.com/Radarr/Radarr/develop/src/Radarr.Api.V3/openapi.json",
  },
  skolenhetsregistret: {
    openapi: "https://api.skolverket.se/skolenhetsregistret/openapi.yaml",
  },
  sonarr: {
    openapi:
      "https://raw.githubusercontent.com/Sonarr/Sonarr/develop/src/Sonarr.Api.V3/openapi.json",
  },
};
