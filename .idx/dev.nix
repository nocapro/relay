{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.bun
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "sh"
          "-c"
          "cd apps/api && cargo run & sleep 5 && bun run --filter 'relay' dev -- --host 0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}