import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Button, 
  Input, 
  FormLayout, 
  FormSection, 
  FormField, 
  FormGroup,
  Text,
  Flex,
  DataTable,
  DatePickerInput,
} from '../../../../packages/ui/src/components';
import { AccessibleAnnouncer, AccessibleModal } from '../../../../packages/ui/src/components/_internal/Accessibility';
import { useAccessibility } from '../../../../packages/ui/src/core/accessibility/context';
import { DESIGN_TOKENS } from '../../../../packages/ui/src/core';

const AccessibilityDemo: React.FC = () => {
  const {
    announce,
    announcements,
    prefersReducedMotion,
    screenReaderEnabled,
    currentFocusId,
    setFocus,
    restoreFocus,
  } = useAccessibility();

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: null as Date | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setModalVisible(true);
    }
  };

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
  ];

  const columns = [
    { key: 'name', header: 'Name', accessor: 'name' as keyof typeof sampleData[0] },
    { key: 'email', header: 'Email', accessor: 'email' as keyof typeof sampleData[0] },
    { key: 'status', header: 'Status', accessor: 'status' as keyof typeof sampleData[0] },
  ];

  return (
    <AccessibleAnnouncer announcements={announcements}>
      <ScrollView style={{ flex: 1, }}>
        <View style={{ padding: DESIGN_TOKENS.spacing.lg }}>
          <Text size="xl" weight="bold" style={{ marginBottom: DESIGN_TOKENS.spacing.xl }}>
            Accessibility Features Demo
          </Text>

        {/* Reduced Motion Support */}
        <FormSection 
          title="Reduced Motion Support" 
          description="All animations respect the user's reduced motion preference"
          spacing="lg"
        >
          <Flex direction="row" gap="md">
            <Button variant="filled" size="md">
              Animated Button
            </Button>
            <Button variant="outline" size="md" loading>
              Loading Button
            </Button>
          </Flex>
        </FormSection>

        {/* Focus Management Demo */}
        <FormSection 
          title="Focus Management" 
          description="Components support proper focus behavior and keyboard navigation"
          spacing="lg"
        >
          <FormLayout variant="card" spacing="md">
            <FormGroup direction="row" columns={2} spacing="md">
              <FormField 
                label="First Name" 
                required 
                error={errors.firstName}
              >
                <Input
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  placeholder="Enter first name"
                />
              </FormField>

              <FormField 
                label="Last Name" 
                required={false}
              >
                <Input
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Enter last name"
                />
              </FormField>
            </FormGroup>

            <FormField 
              label="Email Address" 
              required 
              error={errors.email}
              description="We'll use this to send you important updates"
            >
              <Input
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email address"
                textInputProps={{ keyboardType: 'email-address' }}
              />
            </FormField>

            <FormField 
              label="Phone Number"
              description="Optional - for account recovery"
            >
              <Input
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                textInputProps={{ keyboardType: 'phone-pad' }}
              />
            </FormField>

            <FormField 
              label="Birth Date"
              description="Used for age verification"
            >
              <DatePickerInput
                value={formData.birthDate}
                onChange={(date) => setFormData(prev => ({ ...prev, birthDate: date as Date | null }))}
                placeholder="Select birth date"
              />
            </FormField>

            <Flex direction="row" gap="md" justify="flex-end" style={{ marginTop: DESIGN_TOKENS.spacing.lg }}>
              <Button variant="outline" onPress={() => setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                birthDate: null,
              })}>
                Clear Form
              </Button>
              <Button variant="filled" onPress={handleSubmit}>
                Submit Form
              </Button>
            </Flex>
          </FormLayout>
        </FormSection>

        {/* Screen Reader Support Demo */}
        <FormSection 
          title="Screen Reader Support" 
          description="All components provide proper labels, hints, and announcements"
          spacing="lg"
        >
          <DataTable
            data={sampleData}
            columns={columns}
          />
        </FormSection>

        {/* Modal with Focus Trap */}
        <AccessibleModal
          visible={modalVisible}
          title="Form Submitted Successfully"
          onDismiss={() => setModalVisible(false)}
        >
          <Text style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
            Thank you for submitting the form! Your information has been saved.
          </Text>
          
          <Flex direction="row" gap="md" justify="flex-end">
            <Button 
              variant="outline" 
              onPress={() => setModalVisible(false)}
              tooltip="Close this dialog"
            >
              Close
            </Button>
          </Flex>
        </AccessibleModal>
      </View>
    </ScrollView>
    </AccessibleAnnouncer>
  );
};

// Main demo component - using global accessibility provider
export default function AccessibilityDemoWithProvider() {
  return <AccessibilityDemo />;
}