// @ts-check
import { BitwigApiFetcher } from "./BitwigApiFetcher";
import { BitwigApiContainer } from "./BitwigApiContainer";

export type generateOptions = {
  beta?: boolean;
};

export async function generate({ beta }: generateOptions): Promise<string> {
  const fetcher = new BitwigApiFetcher(beta);
  const container = new BitwigApiContainer(fetcher);
  await container.fetch();
  const types = container.toTypes();
  const target = await fetcher.save(types);
  return target;
}

generate({ beta: true });
