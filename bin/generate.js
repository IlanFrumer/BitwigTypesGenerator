#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generate } from "../main.js";

const argv = yargs(hideBin(process.argv))
  .strict()
  .option("beta", {
    alias: "b",
    default: false,
    type: "boolean",
    description: "Use Bitwig Studio Beta",
  })
  .option("api-version", {
    alias: "v",
    type: "number",
    description: "Bitwig API Version",
  }).argv;

generate(argv.beta, argv.apiVersion).then((target) => {
  console.log("Bitwig API has generated successfully!!");
  console.log(`Types reference: ${target}`);
});
