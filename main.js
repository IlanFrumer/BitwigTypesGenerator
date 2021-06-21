// @ts-check
import which from "which";
import fs from "fs/promises";
import path from "path";
import { BitwigApi } from "./BitwigApi.js";
import os from "os";

const platform = os.platform();
const homedir = os.homedir();
const folder =
  platform === "linux"
    ? "Bitwig Studio/Controller Scripts"
    : "Documents/Bitwig Studio/Controller Scripts";

/**
 * @param {boolean?} beta
 * @param {number?} version
 */
export async function generate(beta, version) {
  const cmd = beta ? "bitwig-studio-beta" : "bitwig-studio";
  const binPath = await which(cmd);
  const realPath = await fs.realpath(binPath);
  const apiPath = path.resolve(
    path.dirname(realPath),
    "resources/doc/control-surface/api/"
  );

  const api = new BitwigApi(apiPath, version);
  let body = await api.generate();
  let file = `bitwig.d.ts`;
  if (version != null) {
    body = body.replace(
      "loadAPI(version: int)",
      `loadAPI(version: ${version})`
    );
    file = `bitwig-v${version}.d.ts`;
  }

  const target = path.resolve(homedir, folder, file);
  await fs.writeFile(target, body);
  return target;
}
