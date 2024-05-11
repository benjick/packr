import "dotenv/config";
import { createRadarrClient } from "../packages/radarr";
import { createSkolenhetsregistretClient } from "../packages/skolenhetsregistret";

const radarr = createRadarrClient({
  baseUrl: process.env.RADARR_EXAMPLE_URL,
  headers: {
    "X-Api-Key": process.env.RADARR_EXAMPLE_API_KEY,
  },
});

const skolenhetsregistret = createSkolenhetsregistretClient({
  baseUrl: "https://api.skolverket.se/skolenhetsregistret",
});

async function radarrTest() {
  const { data, error, response } = await radarr.GET("/api/v3/movie");
  const titles = data?.slice(0, 10).map((movie) => movie.title);
  console.log(titles, error, response.status);
}

async function skolenhetsregistretTest() {
  const { data, error, response } = await skolenhetsregistret.GET(
    "/v1/skolform"
  );
  const skolformer = data?.Skolformer?.slice(0, 10).map(
    (skolform) => skolform.Benamning
  );
  console.log(skolformer, error, response.status);
}

void radarrTest();
void skolenhetsregistretTest();
