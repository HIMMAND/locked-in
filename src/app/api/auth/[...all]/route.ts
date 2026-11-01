import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";
async function handler(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 16384)
    return Response.json({ message: "Request too large." }, { status: 413 });
  if (request.body) {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 16384) {
        await reader.cancel();
        return Response.json(
          { message: "Request too large." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    request = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    });
  }
  return (await auth()).handler(request);
}
export { handler as GET, handler as POST };
