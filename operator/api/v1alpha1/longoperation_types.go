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

package v1alpha1

import (
	"github.com/kyma-project/module-manager/operator/pkg/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

// LongOperationSpec defines the desired state of LongOperation
type LongOperationSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Foo is an example field of LongOperation. Edit longoperation_types.go to remove/update
	Foo         string `json:"foo,omitempty"`
	ReleaseName string `json:"releaseName,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:printcolumn:name="State",type=string,JSONPath=".status.state"
//+kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"

// LongOperation is the Schema for the longoperations API
type LongOperation struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   LongOperationSpec `json:"spec,omitempty"`
	Status types.Status      `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// LongOperationList contains a list of LongOperation
type LongOperationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []LongOperation `json:"items"`
}

func init() {
	SchemeBuilder.Register(&LongOperation{}, &LongOperationList{})
}

var _ types.CustomObject = &LongOperation{}

func (s *LongOperation) GetStatus() types.Status {
	return s.Status
}

func (s *LongOperation) SetStatus(status types.Status) {
	s.Status = status
}

func (s *LongOperation) ComponentName() string {
	return "long-operation"
}
