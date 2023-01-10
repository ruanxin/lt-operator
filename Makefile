MODULE_NAME ?= loadtest
MODULE_VERSION ?= 0.0.5

TEMPLATE_DIR ?= charts/$(MODULE_NAME)-operator
GEN_CHART ?= sh hack/gen-chart.sh
GEN_MODULE_TEMPLATE ?= sh hack/gen-mod-template.sh

# Module Registry used for pushing the image
#MODULE_REGISTRY ?= europe-west3-docker.pkg.dev/sap-kyma-jellyfish-dev/$(MODULE_NAME)-operator-private/unsigned
MODULE_REGISTRY ?= https://registry-1.docker.io/xinruan718
# Desired Channel of the Generated Module Template
MODULE_TEMPLATE_CHANNEL ?= stable

# Image URL to use all building/pushing image targets
IMG_REGISTRY ?= europe-west3-docker.pkg.dev/sap-kyma-jellyfish-dev/operator-images
IMG ?= $(IMG_REGISTRY)/$(MODULE_NAME)-operator:$(MODULE_VERSION)

.PHONY: module-default
module-default:
	cp operator/config/samples/* default.yaml

.PHONY: operator/manifests
operator/manifests: ## Call Manifest Generation
	$(MAKE) -C operator/ manifests

.PHONY: operator/docker-build
operator/docker-build:
	IMG=$(IMG) $(MAKE) -C operator/ docker-build

.PHONY: operator/docker-push
operator/docker-push:
ifneq (,$(GCR_DOCKER_PASSWORD))
	docker login $(IMG_REGISTRY) -u oauth2accesstoken --password $(GCR_DOCKER_PASSWORD)
endif
	IMG=$(IMG) $(MAKE) -C operator/ docker-push

# This will change the flags of the `kyma alpha module create` command in case we spot credentials
# Otherwise we will assume http-based local registries without authentication (e.g. for k3d)
ifeq (,$(MODULE_CREDENTIALS))
MODULE_CREATION_FLAGS=--registry $(MODULE_REGISTRY) -w --insecure
else
MODULE_CREATION_FLAGS=--registry $(MODULE_REGISTRY) -w -c $(MODULE_CREDENTIALS)
endif

.PHONY: module-operator-chart
module-operator-chart: operator/manifests kustomize ## Bundle the Module Operator Chart
	mkdir -p "$(TEMPLATE_DIR)"/templates $(TEMPLATE_DIR)/crds/
	cd operator/config/manager && $(KUSTOMIZE) edit set image controller=${IMG}
	$(KUSTOMIZE) build operator/config/default -o $(TEMPLATE_DIR)/templates/
	mv $(TEMPLATE_DIR)/templates/apiextensions.k8s.io_v1_customresourcedefinition_* $(TEMPLATE_DIR)/crds
	MODULE_NAME=$(MODULE_NAME) MODULE_VERSION=$(MODULE_VERSION) $(GEN_CHART) > $(TEMPLATE_DIR)/Chart.yaml

.PHONY: module-build
module-build: kyma module-operator-chart module-default ## Build the Module and push it to a registry defined in MODULE_REGISTRY
	$(KYMA) alpha create module -n kyma.project.io/module/$(MODULE_NAME) -v -p ./charts/loadtest-operator --version $(MODULE_VERSION) $(MODULE_CREATION_FLAGS)


.PHONY: module-image
module-image: operator/docker-build operator/docker-push ## Build the Module Image and push it to a registry defined in IMG_REGISTRY
	echo "built and pushed module image $(IMG)"
##@ Tools

## Location to install dependencies to
LOCALBIN ?= $(shell pwd)/bin
$(LOCALBIN):
	mkdir -p $(LOCALBIN)

########## Kustomize ###########
KUSTOMIZE_VERSION ?= v4.5.6
KUSTOMIZE ?= $(LOCALBIN)/kustomize
.PHONY: kustomize
kustomize: $(KUSTOMIZE) ## Download & Build kustomize locally if necessary.
$(KUSTOMIZE): $(LOCALBIN)
	GOBIN=$(LOCALBIN) go install sigs.k8s.io/kustomize/kustomize/v4@$(KUSTOMIZE_VERSION)

########## Kyma CLI ###########
KYMA_STABILITY ?= unstable

KYMA ?= $(LOCALBIN)/kyma-$(KYMA_STABILITY)
kyma: $(KYMA) ## Download kyma locally if necessary.
$(KYMA):
	test -f $@ || curl -# -Lo $(KYMA) https://storage.googleapis.com/kyma-cli-$(KYMA_STABILITY)/kyma-darwin
	chmod 0100 $(KYMA)