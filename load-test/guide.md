- replace the secret with your own remote cluster kubeconfig
    ```
    export KUBECONFIG=[remote-cluster-kubeconfig-file].yaml
    ./k3d-secret-gen.sh
    ```
    you will see the data.config in lt-secret-worker.yaml get updated.
- run k6 script, it will deploy 10 kyma each with 20 modules into your kcp cluster
    > be sure to switch your KUBECONFIG to KCP cluster before running k6 script
  ``` 
  ./k6 run load_generator.js
  ```  

