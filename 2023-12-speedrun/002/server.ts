const port = process.env.PORT || 3000;

if (process.env.FLAG) {
  Bun.write("/flag", process.env.FLAG);
  delete process.env.FLAG;
  delete Bun.env.FLAG;
}

Bun.serve({
  port,
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (req.method === "POST" && path === "/run") {
      const json = await req.json();
      const command = json.command;
      if (
        !Array.isArray(command) ||
        !command.every((c): c is string => typeof c === "string") ||
        command.length === 0
      ) {
        return Response.json({ error: "Invalid command." });
      }

      if (command[0].includes("/")) {
        return Response.json({ error: "Only commands in /bin are allowed!" });
      }
      if (["cat", "sh"].some((banned) => command[0].includes(banned))) {
        return Response.json({ error: "Banned!" });
      }

      command[0] = "/bin/" + command[0];

      try {
        const proc = Bun.spawnSync(command, { env: Bun.env });
        return Response.json({
          stdout: proc.stdout.toString(),
          stderr: proc.stderr.toString(),
        });
      } catch (e: unknown) {
        return Response.json({
          error: String(e),
        });
      }
    }
    return new Response(Bun.file("index.html"));
  },
});
