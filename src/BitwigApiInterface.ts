import { default as $, Element } from "cheerio";
import { BitwigApiEntity, MemItem } from "./BitwigApiEntity";
import * as Global from "./BitwigApiGlobal";
import { BitwigApiMethod } from "./BitwigApiMethod";
import { Utils } from "./Utils";

const CALLBACK_REGEX = /^\w*Callback(\<\w+\>)?/;

export class BitwigApiInterface extends BitwigApiEntity {
  get sort() {
    return CALLBACK_REGEX.test(this.declaration.value) ? 150 : 300;
  }

  private attributes = new Set<string>();
  private classes = new Set<string>();
  private methods = new Map<string, BitwigApiMethod>();

  setPublicAttributes({ def }: MemItem) {
    def = def.replace("=", ":");
    this.attributes.add(`readonly ${def};\n`);
  }

  setClasses({ def }: MemItem) {
    this.classes.add(def);
  }

  setPublicMemberFunctions({ id, def, type }: MemItem) {
    const method = new BitwigApiMethod(def, type);
    this.methods.set(id, method);
  }
  setMemberFunctionDocumentation(id: string, desc: string) {
    const method = this.methods.get(id);
    if (!method) throw new Error(`Unmatched method id ${id}`);
    method.setDescription(desc);
  }

  toType() {
    let body = this.description;
    const match = this.declaration.value.match(CALLBACK_REGEX);
    if (match) {
      const methods = [...this.methods.values()];
      const method = methods.shift();
      // if (methods.length)
      //   methods.forEach((m) => console.warn(`ignored ${m.name}`));
      return `type ${match[0]} = ${method?.toCallbackType() ?? "Function"};`;
    }
    body += `${this.declaration.type} ${this.declaration.value} {\n`;
    for (const line of this.attributes.values()) {
      body += line;
    }
    for (const method of this.methods.values()) {
      body += method.toType();
    }
    body += "}";

    if (this.classes.size) {
      body += "\n\n";
      body += `namespace ${this.declaration.name} {`;
      [...this.classes].forEach(
        (cl) => (body += `export type ${cl} = ${Global.namespace}.${cl};`)
      );
      body += "}";
    }

    return body;
  }
}
