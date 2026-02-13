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
          "bun"
          "run"
          "--filter"
          "relay"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
      api = {
        command = [
          "bun"
          "run"
          "--filter"
          "@relaycode/api"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}