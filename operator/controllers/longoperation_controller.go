/*
Copyright 2022.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controllers

import (
	"context"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	"fmt"
	"github.com/kyma-project/module-manager/operator/pkg/declarative"
	"github.com/kyma-project/module-manager/operator/pkg/types"
	"github.com/ruanxin/lt-operator/operator/api/v1alpha1"
	"k8s.io/client-go/rest"
)

// LongOperationReconciler reconciles a LongOperation object
type LongOperationReconciler struct {
	declarative.ManifestReconciler
	client.Client
	Scheme *runtime.Scheme
	*rest.Config
}

const (
	sampleAnnotationKey   = "owner"
	sampleAnnotationValue = "lt-operator"
	chartPath             = "./module-chart"
	chartNs               = "redis"
	nameOverride          = "custom-name-override"
)

//+kubebuilder:rbac:groups=operator.kyma-project.io,resources=longoperations,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=operator.kyma-project.io,resources=longoperations/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=operator.kyma-project.io,resources=longoperations/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the LongOperation object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *LongOperationReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// TODO(user): your logic here

	return ctrl.Result{}, nil
}

func (r *LongOperationReconciler) initReconciler(mgr ctrl.Manager) error {
	manifestResolver := &ManifestResolver{}
	return r.Inject(mgr, &v1alpha1.LongOperation{},
		declarative.WithManifestResolver(manifestResolver),
		declarative.WithCustomResourceLabels(map[string]string{"sampleKey": "sampleValue"}),
		declarative.WithPostRenderTransform(transform),
		declarative.WithResourcesReady(true),
	)
}

type ManifestResolver struct{}

func transform(_ context.Context, _ types.BaseCustomObject, manifestResources *types.ManifestResources) error {
	for _, resource := range manifestResources.Items {
		annotations := resource.GetAnnotations()
		if annotations == nil {
			annotations = make(map[string]string, 0)
		}
		if annotations[sampleAnnotationKey] == "" {
			annotations[sampleAnnotationKey] = sampleAnnotationValue
			resource.SetAnnotations(annotations)
		}
	}
	return nil
}

func (m ManifestResolver) Get(obj types.BaseCustomObject) (types.InstallationSpec, error) {
	sample, valid := obj.(*v1alpha1.LongOperation)
	if !valid {
		return types.InstallationSpec{},
			fmt.Errorf("invalid type conversion for %s", client.ObjectKeyFromObject(obj))
	}
	return types.InstallationSpec{
		ChartPath:   chartPath,
		ReleaseName: sample.Name,
		ChartFlags: types.ChartFlags{
			ConfigFlags: types.Flags{
				"Namespace":       chartNs,
				"CreateNamespace": true,
			},
			SetFlags: types.Flags{
				"nameOverride": nameOverride,
			},
		},
	}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *LongOperationReconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Config = mgr.GetConfig()
	if err := r.initReconciler(mgr); err != nil {
		return err
	}

	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.LongOperation{}).
		Complete(r)
}
