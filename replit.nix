{ pkgs }:
let
  namako = import ./flake.nix {};
in {
    deps = [
      namako.outputs.namako-language-server
      namako.outputs.namako
      pkgs.replitPackages.jest
    ];
}
