import { createSkolenhetsregistretClient } from "@packr/skolenhetsregistret";

const skolenhetsregistret = createSkolenhetsregistretClient({
  baseUrl: "https://api.skolverket.se/skolenhetsregistret",
});

async function skolenhetsregistretTest() {
  const { data, error, response } = await skolenhetsregistret.GET(
    "/v1/skolform"
  );
  const skolformer = data?.Skolformer?.slice(0, 10).map(
    (skolform) => skolform.Benamning
  );
  console.log(skolformer, error, response.status);
}

void skolenhetsregistretTest();
