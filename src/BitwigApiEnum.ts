import { BitwigApiEntity, MemItem } from "./BitwigApiEntity";

export class BitwigApiEnum extends BitwigApiEntity {
  readonly sort = 100;

  private readonly types = new Set<string>();

  setStaticPublicMemberFunctions({ id, def, type }: MemItem) {
    /**
     * @Todo
     * need to overload enums
     */
    // console.log(def, type);
  }

  setPublicMemberFunctions({ def, type }: MemItem) {
    /**
     * @Todo
     * need to overload enums
     */
    // console.log(def, type);
  }

  setPublicAttributes({ type }: MemItem) {
    type = type.replace(/\s*=.+$/, "");
    this.types.add(type);
  }
  toType() {
    let body = this.description;
    const types = [...this.types].map((type) => `"${type}"`).join(" | ");
    body += `type ${this.declaration.value} = ${types};`;

    return body;
  }
}
