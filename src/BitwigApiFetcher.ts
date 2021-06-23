import os from "os";
import path from "path";
import which from "which";
import fs from "fs/promises";
import cheerio from "cheerio";
import prettier from "prettier";

const platform = os.platform();
const homedir = os.homedir();

const RESOURCES = "resources/doc/control-surface/api/";
const CONTROLLER_SCRIPTS =
  platform === "linux"
    ? "Bitwig Studio/Controller Scripts"
    : "Documents/Bitwig Studio/Controller Scripts";

export class BitwigApiFetcher {
  private readonly api: Promise<string>;
  constructor(beta = false) {
    const cmd = beta ? "bitwig-studio-beta" : "bitwig-studio";
    this.api = new Promise<string>(async (resolve, reject) => {
      try {
        const binPath = await which(cmd);
        const binRealPath = await fs.realpath(binPath);
        const dirPath = path.dirname(binRealPath);
        const apiPath = path.resolve(dirPath, RESOURCES);
        resolve(apiPath);
      } catch (e) {
        reject(e);
      }
    });
  }

  async loadClasses() {
    return this.load("classes.html");
  }

  async load(html: string) {
    const api = await this.api;
    const classesPath = path.resolve(api, html);
    const body = await fs.readFile(classesPath, "utf-8");
    return cheerio.load(body);
  }

  async save(ts: string) {
    const file = `bitwig.d.ts`;
    const filepath = path.resolve(homedir, CONTROLLER_SCRIPTS, file);

    ts = await prettier.format(ts, {
      filepath,
      parser: "babel-ts",
    });
    await fs.writeFile(filepath, ts);
    return filepath;
  }
}
