import { BitwigApiEntity, MemItem } from "./BitwigApiEntity";
import { BitwigApiMethod } from "./BitwigApiMethod";

export class BitwigApiClass extends BitwigApiEntity {
  readonly sort = 200;

  private staticAttributes = new Map<string, string>();
  private staticMethods = new Map<string, BitwigApiMethod>();
  private methods = new Map<string, BitwigApiMethod>();

  setStaticPublicAttributes({ id, def, type }: MemItem) {
    const t = type.match(/static final (\w+)/)![1];
    const line = "static " + def.replace(/\s*=(.+)$/, `: ${t}; //$1\n`);
    this.staticAttributes.set(id, line);
  }

  setStaticPublicMemberFunctions({ id, def, type }: MemItem) {
    const method = new BitwigApiMethod(def, type, true);
    this.staticMethods.set(id, method);
  }

  setPublicMemberFunctions({ id, def, type }: MemItem) {
    const method = new BitwigApiMethod(def, type);
    this.methods.set(id, method);
  }

  setMemberFunctionDocumentation(id: string, desc: string) {
    let method = this.methods.get(id) || this.staticMethods.get(id);
    method!.setDescription(desc);
  }

  toType() {
    let body = this.description;
    body += `${this.declaration.type} ${this.declaration.value} {\n`;
    for (const line of this.staticAttributes.values()) {
      body += line;
    }
    for (const method of this.staticMethods.values()) {
      body += method.toType();
    }
    for (const method of this.methods.values()) {
      body += method.toType();
    }
    body += "}";
    return body;
  }
}
