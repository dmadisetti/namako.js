{
  description = "expose as a flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-21.11";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      isImported = builtins.length (builtins.attrNames nixpkgs) == 0;
      pkgs = if isImported then pkgs else (import nixpkgs {
        inherit system;
      });
    in
    {
      packages."${system}" = (import ./namako.nix {inherit self pkgs;}).packages;
    };
}
