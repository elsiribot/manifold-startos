# aarch64 needs an aarch64 build of the OCI image (nix build on an arm
# machine or with binfmt emulation); only x86 is built by default.
ARCHES := x86
# overrides to s9pk.mk must precede the include statement
include node_modules/@start9labs/start-sdk/s9pk.mk

# The manifest references the service image as a local podman tag
# (dockerTag: localhost/fleet-manager-startos:0.1.0). The image is built by
# this repo's nix flake (which wraps fedibtc/manifold's
# fleet-manager-oci-image) and must be loaded into podman before
# `start-cli s9pk pack` runs.
IMAGE_TAG := localhost/fleet-manager-startos:0.1.0

$(BASE_NAME).s9pk: image-loaded
$(BASE_NAME)_x86_64.s9pk: image-loaded

.PHONY: image-loaded
image-loaded:
	nix build .#oci-image -o result-oci-image
	@digest=$$(readlink result-oci-image); \
	if [ ! -f .image-loaded ] || [ "$$(cat .image-loaded)" != "$$digest" ] \
		|| ! podman image exists $(IMAGE_TAG); then \
		echo "   Loading $(IMAGE_TAG) into podman..."; \
		podman load -i result-oci-image; \
		echo "$$digest" > .image-loaded; \
	else \
		echo "   $(IMAGE_TAG) already loaded."; \
	fi
