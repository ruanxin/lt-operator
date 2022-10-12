#! /bin/bash
echo "
apiVersion: v1
kind: Secret
metadata:
  name: replace-me
  labels:
    operator.kyma-project.io/managed-by: lifecycle-manager
    operator.kyma-project.io/kyma-name: replace-me
type: Opaque
data:
  config: $(kubectl config view --raw --minify | sed 's/---//g' | base64)" > lt-secret-worker.yaml
