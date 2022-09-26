## Getting Started
You’ll need a Kubernetes cluster to run against. You can use [KIND](https://sigs.k8s.io/kind) to get a local cluster for testing, or run against a remote cluster.
**Note:** Your controller will automatically use the current context in your kubeconfig file (i.e. whatever cluster `kubectl cluster-info` shows).

### Running on the cluster

1. Build and push your image to the location specified by `IMG`:

`<some-registry>` can be github registry or docker hub, and make sure the image in the repository is public accessible.

```sh
cd operator
make docker-build docker-push IMG=<some-registry>/lt-operator:tag
```
	
2. Deploy the controller to the cluster with the image specified by `IMG`:

```sh
make deploy IMG=<some-registry>/lt-operator:tag
```

3. Install Instances of Custom Resources:

```sh
kubectl apply -f config/samples/
```
After deployed, you should see the CR in ready state
```sh
kubectl get longoperations.operator.kyma-project.io -A 

NAMESPACE   NAME                   STATE   AGE
default     longoperation-sample   Ready   3m23s

```


### Uninstall CRDs
To delete the CRDs from the cluster:

```sh
make uninstall
```

### Undeploy controller
UnDeploy the controller to the cluster:

```sh
make undeploy
```
