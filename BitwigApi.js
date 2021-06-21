// @ts-check
import prettier from "prettier";
import path from "path";
import fs from "fs/promises";
import cheerio from "cheerio";
import { isTag, isText } from "domhandler";
import { BitwigApiType } from "./BitwigApiType.js";
import {
  getApiDeprecated,
  getApiVersion,
  parseMethod,
  parseParam,
  parseTitle,
  wrapDesc,
} from "./utils.js";
import { globalTypes, javaPolyfills } from "./global.js";

export class BitwigApi {
  /**
   * @param {string} apiPath
   * @param {number} version
   */
  constructor(apiPath, version) {
    /**
     * @private
     */
    this.apiPath = apiPath;

    /**
     * @private
     * @type {Map<string, BitwigApiType>}
     */
    this.types = new Map();

    /**
     * @private
     * @type {number}
     */
    this.version = version;
  }

  async generate() {
    let body = "";
    body += "declare global {";
    body += "namespace Bitwig {";
    body += javaPolyfills;

    await this.fetchAPITypes();
    let enums = "";
    let classes = "";
    for (const apiType of this.types.values()) {
      if (apiType.isEnum) enums += apiType.toBody();
      else classes += apiType.toBody();
    }

    body += `${enums}\n${classes}`;
    body += "}\n\n";
    body += globalTypes;
    body += "}\n";
    body += "export {}";

    body = await prettier.format(body, { filepath: "index.d.ts" });
    return body;
  }

  /**
   * @private
   */
  async fetchAPITypes() {
    const classesPath = path.resolve(this.apiPath, "classes.html");
    const body = await fs.readFile(classesPath, "utf-8");
    const $ = cheerio.load(body);
    for (const el of $(".classindex .el").toArray()) {
      const href = $(el).attr("href").trim();
      if (!isText(el.nextSibling)) throw new Error("Error");
      // const lib = el.nextSibling.nodeValue.trim();
      await this.fetchType(href);
    }
  }

  /**
   * @param {string} href
   * @returns {Promise<BitwigApiType>}
   */
  async fetchType(href) {
    let type = this.types.get(href);
    if (type) return type;

    const filepath = path.resolve(this.apiPath, href);
    type = new BitwigApiType();
    this.types.set(href, type);

    const body = await fs.readFile(filepath, "utf-8");
    const $ = cheerio.load(body);
    let id = null;

    const def = parseTitle($(".headertitle").text().trim());
    type.def = def;

    for (const node of $(".contents")[0].childNodes) {
      if (isTag(node)) {
        if (node.attribs.id) id = node.attribs.id;
        switch (node.attribs.class) {
          case "dyncontent":
            break;
          case "memberdecls":
            if (type.isEnum && $('[name="pub-attribs"]', node).length > 0) {
              $(".memItemLeft a[id]", node).each((_i, d) => {
                const id = $(d).attr("id");
                const def = $(d)
                  .parent()
                  .siblings(".memItemRight")
                  .text()
                  .trim();
                type.enums.set(id, {
                  def,
                  desc: "",
                });
              });
            }

            break;
          case "groupheader":
            break;
          case "textblock":
            const [source, line] = $(".definition a.el:first-of-type", node)
              .attr("href")
              .split("#");

            const b = await fs.readFile(
              path.resolve(this.apiPath, source),
              "utf-8"
            );
            const $$ = cheerio.load(b);
            const l = $$(`[name="${line}"]`).parent();
            l.find(".lineno").remove();
            type.line = (
              l
                .text()
                .trim()
                .replace("@interface", "interface")
                .replace("<String>", "<string>") + "{"
            ).replace(/\<(.+?) extends (.+?)\>/, "<$1 @@@@ $2>");

            if (
              type.line.includes("interface ") &&
              type.line.includes("extends")
            ) {
              type.line = type.line
                .replace("interface ", "type ")
                .replace("extends", "=")
                .replace(/, /g, " & ")
                .replace("{", " & {");
            }
            type.line = type.line.replace("@@@@", "extends");

            break;
          case "memtitle":
            // no-op
            break;
          case "memitem":
            const types = $(".memproto td.memname", node).text().trim();
            const desc = $(".memdoc p", node).text();
            const since = getApiVersion(node);
            if (this.version != null && since != null && since > this.version)
              break;
            const deprecated = getApiDeprecated(node);

            if (type.isEnum) {
              type.enums.set(id, {
                def: types,
                desc: wrapDesc(desc, since),
                since,
              });

              break;
            }
            const link = $(".memproto td.memname a", node).attr("href");
            const ref = link ? (await this.fetchType(link)).def.ref : null;
            const { title, returns } = parseMethod(types, ref);

            const params = $(".memproto td.paramtype", node)
              .toArray()
              .map((el) =>
                parseParam(
                  $(el).text().trim(),
                  $(el).siblings(".paramname").text().trim()
                )
              )
              .join(", ");

            type.methods.set(id, {
              title,
              since,
              params,
              returns,
              desc: wrapDesc(desc, since, deprecated),
            });
            break;
          case "dynheader closed":
          case "dynsummary":
          case undefined:
            break;
          default:
            throw new Error(`Unkonwn class: ${node.attribs.class} (${href})`);
        }
      } else if (isText(node)) {
        //   console.log(node.nodeValue);
      }
    }
    return type;
  }
}
