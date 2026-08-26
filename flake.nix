{
  description = "StartOS service image for Manifold Fleet Manager (FMan)";

  inputs = {
    manifold.url = "github:fedibtc/manifold";
    nixpkgs.follows = "manifold/nixpkgs";
  };

  outputs =
    {
      self,
      manifold,
      nixpkgs,
    }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems f;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          baseImage = manifold.packages.${system}.fleet-manager-oci-image;
        in
        rec {
          # Manifold's fleet-manager image, adapted for StartOS SubContainers.
          #
          # The upstream image is Nix-built: it has no /etc/passwd or
          # /etc/group at all, and its /etc/ssl is a symlink into
          # /nix/store. StartOS SubContainers fail to resolve /etc symlinks
          # into the store at runtime (see the fedimint-guardian-startos
          # Dockerfile for the same workaround), and fedimintd's fs-mistrust
          # checks perform getpwuid lookups that need a real /etc/passwd.
          # `extraCommands` materializes /etc as regular files in the top
          # layer.
          oci-image = pkgs.dockerTools.buildLayeredImage {
            name = "fleet-manager-startos";
            tag = "0.1.0";
            fromImage = baseImage;
            extraCommands = ''
              # Runtime mountpoint stubs. Docker-built images inherit these
              # from their build containers, but dockerTools images have
              # none, and StartOS's subcontainer launcher needs them to
              # exist (no /proc mountpoint -> PID 1 never starts -> "Failed
              # to start subcontainer").
              mkdir -p proc sys dev run tmp data root
              chmod 1777 tmp
              mkdir -p etc/ssl
              cat > etc/passwd <<'EOF'
              root:x:0:0:root:/root:/bin/false
              nobody:x:65534:65534:nobody:/:/bin/false
              EOF
              cat > etc/group <<'EOF'
              root:x:0:
              nogroup:x:65534:
              EOF
              cat > etc/nsswitch.conf <<'EOF'
              passwd: files
              group: files
              hosts: files dns
              EOF
              cp -rL ${pkgs.cacert}/etc/ssl/certs etc/ssl/certs
            '';
            config = {
              # Stable, store-hash-independent path shipped by the base image
              # exactly for platform packages that pin the entrypoint by path.
              Entrypoint = [ "/usr/local/bin/fleet-manager-entrypoint" ];
              Env = [
                "FLEET_MANAGER_DATA_DIR=/data"
                "SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt"
              ];
              WorkingDir = "/data";
            };
          };
          default = oci-image;
        }
      );
    };
}
