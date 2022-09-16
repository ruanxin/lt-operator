#! /bin/bash
echo "
apiVersion: v1
kind: Secret
metadata:
  name: kyma-sample #change with your kyma name
  labels:
    "operator.kyma-project.io/managed-by": "lifecycle-manager"
    "operator.kyma-project.io/kyma-name": "kyma-sample"
type: Opaque
data:
  config: $(kubectl config view --raw --minify | sed 's/---//g' | base64)" > secret-skr.yaml
