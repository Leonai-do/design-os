
import { PrdContext, DiscoveryStep, DynamicField } from "../../types";

export const useDynamicValidation = (context: PrdContext, currentStep: DiscoveryStep, history: DiscoveryStep[]) => {
  
  const isFieldValid = (fieldId: string) => {
    if (fieldId.startsWith('custom_notes_')) return true;
    const val = context[fieldId];
    if (Array.isArray(val)) return val.length > 0;
    return val && val.trim().length > 0;
  };

  const isCurrentStepValid = () => {
    return currentStep.fields.every(f => {
      if (f.dependsOn && context[f.dependsOn.fieldId] !== f.dependsOn.value) {
        return true;
      }
      return isFieldValid(f.id);
    });
  };

  const getLabelForKey = (key: string) => {
    if (key.startsWith('custom_notes_')) return "Additional Notes";
    let field = currentStep.fields.find(f => f.id === key);
    if (field) return field.label;
    for (const step of history) {
        field = step.fields.find(f => f.id === key);
        if (field) return field.label;
    }
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  const getNotesField = (stepId: number): DynamicField => ({
    id: `custom_notes_${stepId}`,
    type: 'textarea',
    label: 'Additional Notes / Custom Instructions',
    placeholder: 'Any specific details, clarifications, or constraints for this section...',
    description: 'Optional: Add free-form context that doesn\'t fit in the fields above.'
  });

  return { isFieldValid, isCurrentStepValid, getLabelForKey, getNotesField };
};
