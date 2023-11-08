const port = process.env.PORT || 3000;

if (process.env.FLAG) {
  Bun.write("/flag", process.env.FLAG);
}

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") {
      return new Response("Welcome to Bun!");
    } else if (url.pathname === "/zzz") {
      return new Response("sleeping...");
    } else if (url.pathname === "/flag") {
      return new Response("read /flag!");
    } else if (req.method === "POST" && url.pathname === "/fetch") {
      const fetchUrl = url.searchParams.get("url") || "";

      if ([...fetchUrl].some((c) => [..."flatt"].includes(c))) {
        return new Response("Nope", { status: 400 });
      }

      // by the way, where is the implementation of fetch: https://github.com/oven-sh/bun
      const res = await fetch(new URL(fetchUrl, `http://localhost:${port}/`));
      return new Response((await res.blob()).stream());
    }

    return new Response("Not found", { status: 404 });
  },
});
