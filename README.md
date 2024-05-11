# packr

### 📦 Find all packages at https://www.npmjs.com/org/packr

## Goals

The purpose of this project is to provide a simple way to use services providing a OpenAPI specification

## How does it work?

Every day at 00:00 UTC, the project will fetch the OpenAPI specification from specified services. If the specification version has changed or no previous version was found, the project will generate a new package and publish it to npm.

## Contributing

Add a new service to `packages.ts` and create a pull request.
