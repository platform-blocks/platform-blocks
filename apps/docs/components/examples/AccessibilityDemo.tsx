import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Button, 
  Form,
  FormLayout, 
  FormSection, 
  FormGroup,
  Text,
  Flex,
  DataTable,
  Dialog,
  useAccessibility,
  useFormContext,
  resolveSpacing,
  useTheme,
} from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

const initialValues = { firstName: '', lastName: '', email: '', phone: '', birthDate: null as Date | null };
const validationSchema = {
  firstName: [{ type: 'required' as const, message: 'First name is required' }],
  email: [
    { type: 'required' as const, message: 'Email is required' },
    { type: 'pattern' as const, value: /\S+@\S+\.\S+/, message: 'Email address is invalid' },
  ],
};

function BirthDateField() {
  const form = useFormContext();
  return (
    <Form.Field name="birthDate" label="Birth Date" description="Used for age verification">
      <DatePickerInput
        value={form.values.birthDate as Date | null}
        onChange={(date) => form.setFieldValue('birthDate', date)}
        placeholder="Select birth date"
      />
    </Form.Field>
  );
}

function FormActions() {
  const form = useFormContext();
  return (
    <Flex direction="row" gap="md" justify="flex-end">
      <Button variant="outline" onPress={form.resetForm}>Clear Form</Button>
      <Form.Submit variant="filled">Submit Form</Form.Submit>
    </Flex>
  );
}

const AccessibilityDemo: React.FC = () => {
  const theme = useTheme();
  const { announce } = useAccessibility();
  const [modalVisible, setModalVisible] = useState(false);

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
      <ScrollView style={{ flex: 1, }}>
        <View style={{ padding: resolveSpacing(theme, 'lg') }}>
          <Text size="xl" fw="bold" style={{ marginBottom: resolveSpacing(theme, 'xl') }}>
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
          <Form
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={() => {
              announce('Form submitted successfully');
              setModalVisible(true);
            }}
          >
            <FormLayout variant="card" spacing="md">
              <FormGroup direction="row" columns={2} spacing="md">
                <Form.Field name="firstName" label="First Name" required>
                  <Form.Input placeholder="Enter first name" />
                </Form.Field>
                <Form.Field name="lastName" label="Last Name">
                  <Form.Input placeholder="Enter last name" />
                </Form.Field>
              </FormGroup>
              <Form.Field name="email" label="Email Address" required description="We'll use this to send you important updates">
                <Form.Input placeholder="Enter email address" textInputProps={{ keyboardType: 'email-address' }} />
              </Form.Field>
              <Form.Field name="phone" label="Phone Number" description="Optional - for account recovery">
                <Form.Input placeholder="Enter phone number" textInputProps={{ keyboardType: 'phone-pad' }} />
              </Form.Field>
              <BirthDateField />
              <FormActions />
            </FormLayout>
          </Form>
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
        <Dialog
          opened={modalVisible}
          title="Form Submitted Successfully"
          onClose={() => setModalVisible(false)}
        >
          <Text style={{ marginBottom: resolveSpacing(theme, 'md') }}>
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
        </Dialog>
      </View>
    </ScrollView>
  );
};

// Main demo component - using global accessibility provider
export default function AccessibilityDemoWithProvider() {
  return <AccessibilityDemo />;
}
