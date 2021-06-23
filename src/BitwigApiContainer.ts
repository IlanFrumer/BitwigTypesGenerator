import { Utils } from "./Utils";
import { BitwigApiFetcher } from "./BitwigApiFetcher";
import { BitwigApiEntity, BitwigApiEntityProps } from "./BitwigApiEntity";
import { BitwigApiClass } from "./BitwigApiClass";
import { BitwigApiInterface } from "./BitwigApiInterface";
import { BitwigApiEnum } from "./BitwigApiEnum";
import * as Global from "./BitwigApiGlobal";

export class BitwigApiContainer {
  private readonly entities = new Map<string, BitwigApiEntity>();
  constructor(private readonly fetcher: BitwigApiFetcher) {}

  toTypes() {
    const entities = [...this.entities.values()]
      .sort((a, b) => a.sort - b.sort)
      .map((entity) => entity.toType());

    const module: string[] = [
      Global.Header,
      "declare global {",
      "namespace Bitwig {",
      Global.JavaPolyfills,
      ...entities,
      "}",
      Global.Exports,
      "}",
      "export {}",
    ];
    return module.filter((type) => !!type).join("\n\n");
  }

  async fetch() {
    const $ = await this.fetcher.loadClasses();
    for (const el of $(".classindex .el").toArray()) {
      const href = $(el).attr("href")?.trim();
      // if (el.nextSibling && !isText(el.nextSibling)) throw new Error('Bad class');
      // const lib = el.nextSibling.nodeValue.trim();
      if (href) {
        await this.fetchEntity(href);
      }
    }
  }

  private async fetchEntity(href: string) {
    let entity = this.entities.get(href);
    if (!entity) {
      const $ = await this.fetcher.load(href);
      // const def = $(".headertitle").text().trim();
      // const title = Utils.parseHeader(def);
      const [sourceHref, lineId] = $(".definition a.el:first-of-type")
        .attr("href")!
        .split("#");

      const $$ = await this.fetcher.load(sourceHref);
      const lineContainer = $$(`[name="${lineId}"]`).parent();
      lineContainer.find(".lineno").remove();
      const decl = lineContainer.text().trim();
      const declaration = Utils.parseDeclaration(decl);
      const props: BitwigApiEntityProps = {
        declaration,
        href,
        container: this,
      };

      switch (declaration.type) {
        case "class":
          entity = new BitwigApiClass(props);
          break;
        case "interface":
          entity = new BitwigApiInterface(props);
          break;
        case "enum":
          entity = new BitwigApiEnum(props);

          break;
      }
      this.entities.set(href, entity);
      entity.parse($);
    }

    return entity;
  }
}
