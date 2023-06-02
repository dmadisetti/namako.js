{ pkgs }:
let
  namako = (import ./namako.nix) {inherit pkgs; self=./.;};
in {
    deps = [
      namako.packages.x86_64-linux.namako-language-server
      namako.packages.x86_64-linux.namako
      pkgs.replitPackages.jest
    ];
}
