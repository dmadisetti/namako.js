{ pkgs }:
let
  namako = (import ./namako.nix) {inherit pkgs; self=./.;};
in {
    deps = [
      namako.packages.namako-language-server
      namako.packages.namako
      pkgs.replitPackages.jest
    ];
}
