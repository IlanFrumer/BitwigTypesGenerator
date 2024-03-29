#!/usr/bin/env node
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { generate } = require("../dist/main");

const argv = yargs(hideBin(process.argv))
  .strict()
  .option("beta", {
    alias: "b",
    default: false,
    type: "boolean",
    description: "Use Bitwig Studio Beta",
  })
  .parse();

generate({ beta: argv.beta }).then((target) => {
  console.log("Bitwig API was generated successfully!!");
  console.log(`Types reference: ${target}`);
});
