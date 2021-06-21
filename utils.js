// @ts-check
import { Node } from "domhandler";
import cheerio from "cheerio";

/**
 * Patching generic types
 */
const genericPatch = ["ClipLauncherSlotOrSceneBank", "BrowserItemBank"];

const REGEX_VERSION = /^API version (\d+)$/;
const REGEX_METHOD =
  /^(?:(default|static|abstract|final) )?([A-Za-z0-9]+(?: \[\])?) ([A-Za-z0-9]+)$/;

const REGEX_METHOD_GENERIC =
  /^([A-Za-z0-9]+)\<(\? extends )?([A-Za-z0-9]+)\> ([A-Za-z0-9]+)$/;

const types = ["Interface", "Enum", "Class"];

/**
 *
 * @typedef {{name: string; type: string; abstract: boolean; ref: string}} ApiClassDef
 */

/**
 * @param {Node} node
 */
export function getApiVersion(node) {
  const match = cheerio
    .load(node)("dl.since dd")
    .text()
    .trim()
    .match(REGEX_VERSION);
  return match ? +match[1] : null;
}

/**
 * @param {Node} node
 */
export function getApiDeprecated(node) {
  const $ = cheerio.load(node);
  const el = $("dl.deprecated dd");
  // el.find("a[href]").each((_i, d) => {
  //   const text = $(d).text();
  //   $(d).text(`[${text}]{@link ${text}}`);
  // });
  const dep = el.text().trim();
  return dep ? dep : "";
}

/**
 *
 * @param {string} title
 * @returns {ApiClassDef}
 */
export function parseTitle(title) {
  const abstract = title.endsWith("abstract");
  const t = title.replace(/ (Template )?Reference(abstract)?$/, "");
  for (const type of types) {
    if (t.endsWith(type)) {
      const name = t
        .replace(" " + type, "")
        .replace(/^.+?\./g, "")
        .replace("<String>", "<string>");
      const ref = name.replace(/\<.+/, "");
      return { name, ref, type: type.toLowerCase(), abstract };
    }
  }
  throw new Error(`Unkown title ${title}`);
}

/**
 *
 * @param {string} types
 * * @param {string} ref
 */
export function parseMethod(types, ref) {
  let title = "get";
  let returns = ref ?? "void";
  let match = types.match(REGEX_METHOD);
  if (match) {
    returns = ref ?? parseType(match[2]);

    if (genericPatch.includes(returns)) {
      returns = `${returns}<any>`;
    }
    title = match[3];
  } else {
    match = types.match(REGEX_METHOD_GENERIC);
    if (match) {
      const r = match[1] == "List" ? "Array" : match[1];
      const generic = `<${match[3]}>`;
      returns = `${r}${generic}`;
      title = match[4];
    } else {
      console.log("(TODO):", types);
    }
  }

  return { title, returns };
}

/**
 *
 * @param {string} type
 * @param {string} name
 */
export function parseParam(type, name) {
  type = parseType(type.replace("? extends", "").replace("final ", "").trim());

  name = name.replace("function", "fn").replace(",", "");
  if (type.endsWith("...")) {
    type = parseType(type.replace("...", "[]"));
    name = "..." + name;
  }

  return `${name}: ${type}`;
}

/**
 *
 * @param {string} type
 */
export function parseType(type) {
  const isArray = type.endsWith("[]");
  type = type
    .replace("[]", "")
    .trim()
    .replace(
      /^Function\<(.+?), (.+?)\>$/,
      (_m, m1, m2) => `(val: ${parseType(m2)})=> ${parseType(m1)}`
    )
    .replace(/^String$/, "string")
    .replace(/^Boolean$/, "boolean");

  return isArray ? type + "[]" : type;
}

/**
 * @param {string} desc
 * @param {number?} since
 * @param {string?} deprecated
 */
export function wrapDesc(desc, since = null, deprecated = null) {
  let lines = [];
  if (desc)
    desc
      .replace(/\.\s/g, ". @@@@@")
      .split("@@@@@")
      .forEach((l) => lines.push(l));
  if (since) lines.push("@since " + since);
  if (deprecated) lines.push("@deprecated " + deprecated);
  if (lines.length) {
    return `
      /**
       ${lines.map((line) => `* ${line}`).join("\n")}
       **/\n`;
  } else {
    return "";
  }
}
