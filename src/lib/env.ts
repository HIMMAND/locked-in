import { getCloudflareContext } from "@opennextjs/cloudflare";
export async function env() {
  return (await getCloudflareContext({ async: true })).env;
}
