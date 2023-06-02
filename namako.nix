{ self, pkgs }:
let
  nixify = { name, src }:
    pkgs.stdenv.mkDerivation {
      # Manually declare output so that we have internet access to pull node
      # modules. Nix people hate this btw, since it isn't pure- but guess
      # what it's convenient and removes a moving piece.
      inherit name src;

      # We need unzip to build this package
      buildInputs = [ pkgs.nodePackages.node2nix ];
      buildPhase = ''
        node2nix --development --strip-optional-dependencies --bypass-cache -l package-lock.json
      '';
      # Installing simply means copying all files to the output directory
      installPhase = ''# Build source files and copy them over.
            mkdir -p $out/
            cp *.json $out/
            # lol and but not the flake file since the hash would have to be
            # dependent on itself.
            cp default.nix $out/
            cp node-env.nix $out/
            cp node-packages.nix $out/
        '';
    };
  #node2nix
  createNixNodePackage = { name, src, cmd }:
    let
      packageSrc = nixify { inherit name src; };
      builtPackage = pkgs.callPackage packageSrc { };
      nodeDependencies = builtPackage.shell.nodeDependencies;
    in
    pkgs.writeShellScriptBin name ''
      NODE_PATH=${nodeDependencies}/lib/node_modules \
      PATH=${nodeDependencies}/bin:${pkgs.nodejs}/bin:$PATH ${cmd}
    '';
  createNixNodePackages = builtins.mapAttrs (name: attrs: createNixNodePackage ({ inherit name; } // attrs));
in
{
  packages = createNixNodePackages {
    namako = { src = ./.; cmd = "node ${./.}/repl.js"; };
    namako-language-server = { src = ./lsp; cmd = "npm run --prefix ${./lsp} start -- $@"; };
  };
}
