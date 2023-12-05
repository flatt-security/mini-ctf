import { getClientIp } from "request-ip";

const port = process.env.PORT || 3000;

Bun.serve({
  port,
  fetch(req) {
    // the remote server is running on Cloud Run, so these headers are sent.
    req.headers.delete("x-cloud-trace-context");
    req.headers.delete("x-forwarded-for");
    req.headers.delete("x-forwarded-proto");

    if ([...req.headers.keys()].some((k) => k.startsWith("x"))) {
      return new Response("x header is banned!", { status: 400 });
    }
    if (
      getClientIp({
        headers: Object.fromEntries(req.headers.entries()),
      }) === "127.0.0.1"
    ) {
      return new Response(process.env.FLAG);
    }
    return new Response("You are not coming from 127.0.0.1!");
  },
});
