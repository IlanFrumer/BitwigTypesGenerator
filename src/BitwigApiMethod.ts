import { Utils } from "./Utils";

const DEF_REGEX = /^(.+)\((.*)\)/;
const PARAMS_REGEX = /(?:final )*([\w\<\>\[\],]+)(\.{3})? (\w+)(, )?/g;

export class BitwigApiMethod {
  private readonly name: string;
  private readonly type: string;
  private readonly params: string;
  private description = "";

  constructor(def: string, type: string, isStatic = false) {
    const match = def.match(DEF_REGEX);
    if (!match) throw new Error(`Bad method definition: ${def}`);

    const params = Utils.fixTypes(match[2].trim());

    this.name = match[1].trim();
    this.type = Utils.fixTypes(
      type
        .replace("static ", "")
        .replace("default ", "")
        .replace("abstract ", "")
        .replace("final ", "")
    );
    this.params = "";

    let param: RegExpExecArray | null;
    while ((param = PARAMS_REGEX.exec(params))) {
      const pType = param[2] ? `${param[1]}[]` : param[1];
      const pName = param[2] ? `...${param[3]}` : param[3];
      const pComma = param[4] ?? "";
      this.params += `${pName}: ${pType}${pComma}`;
    }

    // constructor
    if (!this.type) {
      this.type = this.name;
      this.name = "constructor";
    }

    if (isStatic) {
      this.name = `static ${this.name}`;
    }
  }

  setDescription(desc: string) {
    this.description = desc;
  }

  toCallbackType() {
    return `(${this.params}) => ${this.type};`;
  }

  toType() {
    let body = this.description;

    body += `${this.name} (${this.params})`;
    if (this.name !== "constructor") {
      body += `: ${this.type}`;
    }

    body += ";\n";
    return body;
  }
}
