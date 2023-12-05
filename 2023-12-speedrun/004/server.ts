const port = process.env.PORT || 3000;

if (process.env.FLAG) {
  Bun.write("/flag", process.env.FLAG);
  delete process.env.FLAG;
  delete Bun.env.FLAG;
}

async function semgrep(code: string, options?: string[]) {
  const proc = Bun.spawn(
    [
      "/usr/local/bin/semgrep",
      "--metrics=off",
      "--disable-version-check",
      ...(options ?? []),
    ],
    {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        XDG_CONFIG_HOME: "/tmp",
        SEMGREP_VERSION_CACHE_PATH: "/tmp/semgrep_version",
      },
    },
  );
  proc.stdin.write(code);
  proc.stdin.end();

  let stdout = "";
  for await (const chunk of proc.stdout) {
    stdout += new TextDecoder().decode(chunk);
  }
  let stderr = "";
  for await (const chunk of proc.stderr) {
    stderr += new TextDecoder().decode(chunk);
  }
  return { stdout, stderr };
}

Bun.serve({
  port,
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (req.method === "POST" && path === "/run") {
      const json = await req.json();
      const code = json.code;
      if (typeof code !== "string") {
        return Response.json({ error: "Invalid code." });
      }

      try {
        const { stdout: semgrepJson } = await semgrep(code, [
          "--config=./config.yml",
          "--json",
          "-",
        ]);
        const { stdout, stderr } = await semgrep(code, [
          "--config=./config.yml",
          "-",
        ]);

        let output = "";
        if (JSON.parse(semgrepJson).results.length === 0) {
          output = String(
            await new Function(
              `"use strict"; return (async () => { return ${code} })();`
            )()
          );
        }

        return Response.json({
          output,
          stdout,
          stderr,
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
