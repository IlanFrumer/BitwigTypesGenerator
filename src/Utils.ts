import { default as $, Cheerio, Element } from "cheerio";
import { isTag, isText } from "domhandler";

export type BitwigApiDeclaration = {
  type: "class" | "interface" | "enum";
  name: string;
  value: string;
};

export abstract class Utils {
  static fixTypes(types: string) {
    return types
      .replace(/\<\? extends T \>/g, "<T>")
      .replace(/Class\<\?\>/g, "Class")
      .replace(/List\<\? extends (\w+) \>/, "List<$1>")
      .replace(/Function\< (\w+), (\w+) \>/g, "Func<$1,$2>")
      .replace(/ function/g, " fn")
      .replace(/Consumer\< (\w+) \>/g, "Consumer<$1>")
      .replace(/Supplier\< (\w+) \>/g, "Supplier<$1>");
  }

  static parseMemitem(memitem: string) {
    const match = memitem.match(/^memitem:(.+)$/);
    return match ? match[1] : "";
  }

  static parseDeclaration(dec: string): BitwigApiDeclaration {
    dec = Utils.fixTypes(dec);
    let match: RegExpMatchArray | null;
    let type: BitwigApiDeclaration["type"];
    let value: string;
    if ((match = dec.match(/^public class (.+)$/))) {
      type = "class";
      value = match[1];
    } else if ((match = dec.match(/^public abstract class (.+)$/))) {
      type = "class";
      value = match[1];
    } else if ((match = dec.match(/^public interface (.+)$/))) {
      type = "interface";
      value = match[1];
    } else if ((match = dec.match(/^public @interface (.+)$/))) {
      type = "interface";
      value = match[1];
    } else if ((match = dec.match(/^public enum (.+)$/))) {
      type = "enum";
      value = match[1];
    } else if ((match = dec.match(/^enum (.+)$/))) {
      type = "enum";
      value = match[1];
    } else {
      throw new Error(`unknown declaration: ${dec}`);
    }
    const name = value.match(/^\w+/)![0];
    return { type, value, name };
  }

  private static parseNode(el: Element, container: string) {
    let str = "";
    for (const c of el.childNodes) {
      if (isTag(c)) {
        let val = $(c).text();
        switch (c.tagName) {
          case "a":
            if (c.attribs.href.startsWith("http")) {
              str += `{@link ${c.attribs.href} ${val}}`;
            } else {
              val = val
                .replace("#", ".")
                .replace("::", ".")
                .replace(/\(.+$/g, "");
              if (/^[a-z]\w+$/.test(val)) {
                str += `{@link ${container}.${val}}`;
              } else {
                str += `{@link ${val}}`;
              }
            }
            break;
          case "code":
          case "b":
            str += val;
            break;
          case "br":
            break;
        }
      } else if (isText(c)) {
        str += c.nodeValue;
      }
    }

    return str;
  }

  static parseDescription(doc: Cheerio<Element>, container: string) {
    const lines: string[] = doc
      .find("p")
      .toArray()
      .map((el) => Utils.parseNode(el, container));

    for (const dl of doc.find("dl").toArray()) {
      $(dl).removeClass("section");
      const val = Utils.parseNode($("dd", dl)[0], container);
      switch (dl.attribs.class) {
        case "since":
        case "deprecated":
        case "see":
        case "return":
        case "version":
          lines.push(`@${dl.attribs.class} ${val}`);
          break;
        case "exception":
        case "params":
          /**
           * @Todo
           */
          break;

        default:
          throw new Error(`Unkown section description: ${dl.attribs.class}`);
      }
    }

    /**
     * @Todo
     * better comment lines
     */
    if (!lines.length) return "";
    return `/**\n${lines.map((line) => `* ${line}`).join("\n")}\n**/\n`;
  }
}
