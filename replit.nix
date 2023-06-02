{ pkgs }:
let
  namako = (import ./flake.nix).outputs {inherit pkgs; self=./.;};
in {
    deps = [
      namako.outputs.packages.x86_64-linux.namako-language-server
      namako.outputs.packages.x86_64-linux.namako
      pkgs.replitPackages.jest
    ];
}
