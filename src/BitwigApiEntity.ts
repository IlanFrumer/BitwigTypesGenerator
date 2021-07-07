import { default as $, CheerioAPI, Element } from "cheerio";
import type { BitwigApiContainer } from "./BitwigApiContainer";
import { BitwigApiDeclaration, Utils } from "./Utils";

export type BitwigApiEntityProps = {
  container: BitwigApiContainer;
  declaration: BitwigApiDeclaration;
  href: string;
};

export type MemItem = {
  id: string;
  def: string;
  type: string;
};

export abstract class BitwigApiEntity {
  protected description = "";
  constructor(private readonly props: BitwigApiEntityProps) {}

  abstract readonly sort: number;

  get href() {
    return this.props.href;
  }

  get declaration() {
    return this.props.declaration;
  }

  private notImplemented(method: string) {
    const name = Object.getPrototypeOf(this).constructor.name;
    throw new Error(`not implemented: ${name}.${method}`);
  }

  protected setPublicMemberFunctions(item: MemItem) {
    this.notImplemented("setPublicMemberFunctions");
  }
  protected setPublicAttributes(item: MemItem) {
    this.notImplemented("setPublicAttributes");
  }
  protected setClasses(item: MemItem) {
    this.notImplemented("setClasses");
  }
  protected setStaticPublicAttributes(item: MemItem) {
    this.notImplemented("setStaticPublicAttributes");
  }

  protected setStaticPublicMemberFunctions(item: MemItem) {
    this.notImplemented("setStaticPublicMemberFunctions");
  }

  protected setMemberFunctionDocumentation(id: string, desc: string) {
    this.notImplemented("setMemberFunctionDocumentation");
  }

  abstract toType(): string;

  private mapItems(el: Element) {
    const parent = $(el).parentsUntil(".contents").last();
    const items: MemItem[] = parent
      .find('[class*="memitem:"]')
      .toArray()
      .filter((el) => !el.attribs.class.includes("inherit"))
      .map((el) => {
        const id = Utils.parseMemitem(el.attribs.class);
        const type = $(".memItemLeft", el).text().trim();
        const def = $(".memItemRight", el).text().trim();
        return { id, type, def };
      });

    return items;
  }

  parse($$: CheerioAPI) {
    $$(".groupheader").each((_i, el) => {
      const group = $$(el).text().trim();
      switch (group) {
        case "Public Member Functions":
          this.mapItems(el).forEach((item) =>
            this.setPublicMemberFunctions(item)
          );
          break;
        case "Public Attributes":
          this.mapItems(el).forEach((item) => this.setPublicAttributes(item));
          break;
        case "Classes":
          this.mapItems(el).forEach((item) => this.setClasses(item));
          break;
        case "Static Public Attributes":
          this.mapItems(el).forEach((item) =>
            this.setStaticPublicAttributes(item)
          );
          break;
        case "Static Public Member Functions":
          this.mapItems(el).forEach((item) =>
            this.setStaticPublicMemberFunctions(item)
          );
          break;
        case "Detailed Description":
          $$(".definition").remove();
          this.description = Utils.parseDescription(
            $$(el).next(".textblock"),
            this.declaration.name
          );
          break;
        /**
         * @Documenation
         */
        case "Constructor & Destructor Documentation":
          break;
        case "Member Function Documentation":
          for (const element of $$(el)
            .nextUntil(".groupheader,hr")
            .filter("a[id]")) {
            const memitem = $$(element).nextAll().filter(".memitem").first();
            const desc = Utils.parseDescription(
              memitem.find(".memdoc"),
              this.declaration.name
            );
            this.setMemberFunctionDocumentation(element.attribs.id, desc);
          }
          break;
        case "Member Data Documentation":
          /**
           * @Todo
           * enum type Documentation
           */
          break;

        /**
         * @Ignored
         */
        case "Additional Inherited Members":
        case "Protected Member Functions":
          break;
        default:
          throw new Error(`Unknown groupheader ${group}`);
      }
    });
  }
}
