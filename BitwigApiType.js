// @ts-check

export class BitwigApiType {
  constructor() {
    /**
     * @type {import('./utils').ApiClassDef}
     */
    this.def = null;

    /**
     * @type {string}
     */
    this.line = "";

    /**
     * @readonly
     * @type {Map<string,any>}
     */
    this.methods = new Map();

    /**
     * @readonly
     * @type {Map<string,any>}
     */
    this.enums = new Map();

    /**
     * @readonly
     * @type {Map<BitwigApiType, string>}
     */
    this.inherits = new Map();
  }

  get isEnum() {
    return this.def.type === "enum";
  }

  toBody() {
    return `export ${this.line.replace("public ", "")}
      ${[...this.enums.values()]
        .map((d) => `${d.desc}${d.def},`)
        .join("\n")}      
      ${[...this.methods.values()]
        .map((d) => `${d.desc}${d.title}(${d.params}): ${d.returns};\n`)
        .join("\n\n")}
    
    }\n\n`;
  }
}
