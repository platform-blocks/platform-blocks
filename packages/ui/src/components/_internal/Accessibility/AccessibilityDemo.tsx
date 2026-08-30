import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { DESIGN_TOKENS } from '../../../core';
import { useTheme } from '../../../core/theme';
import { Button } from '../../Button';
import { Input } from '../../Input';
import { 
  AccessibilityDebugger, 
  AccessibilityTestSuite 
} from './AccessibilityTesting';
import { 
  SkipLink, 
  Landmark, 
  LiveRegion, 
  ProgressIndicator,
  ErrorBoundaryFallback 
} from './AccessibilityHelpers';
import { 
  useAnnouncementQueue,
  useFocusTrap,
  useKeyboardNavigation,
  useAccessibleValidation,
  useAccessibleLoading,
  useAccessibleToast
} from '../../../core/accessibility/advancedHooks';
import { useAccessibility } from '../../../core/accessibility/context';

/**
 * Comprehensive accessibility demo showcasing all features
 */
export const AccessibilityDemo: React.FC = () => {
  const theme = useTheme();
  const { announce } = useAccessibility();
  
  // Advanced hooks demo
  const { addToQueue } = useAnnouncementQueue();
  const { isLoading, startLoading, stopLoading, updateProgress, getAccessibilityProps } = useAccessibleLoading();
  const { showToast, toasts } = useAccessibleToast();
  
  // Form validation demo
  const emailValidation = useAccessibleValidation('demo-email');
  const [email, setEmail] = React.useState('');
  
  // Navigation demo
  const navigationItems = ['Home', 'Products', 'Services', 'About', 'Contact'];
  const navigation = useKeyboardNavigation(navigationItems, (item) => {
    announce(`Navigating to ${item}`);
  });

  // Focus trap demo (for modal simulation)
  const [modalOpen, setModalOpen] = React.useState(false);
  const focusTrap = useFocusTrap(modalOpen);

  const validateEmail = () => {
    return emailValidation.validate(email, [
      {
        validator: (value) => value.length > 0,
        message: 'Email is required'
      },
      {
        validator: (value) => /\S+@\S+\.\S+/.test(value),
        message: 'Please enter a valid email address'
      }
    ]);
  };

  const handleLoadingDemo = async () => {
    startLoading('Starting data sync...');
    
    // Simulate progress updates
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(i, i === 100 ? undefined : `Progress: ${i}%`);
    }
    
    stopLoading('Data sync completed successfully');
    showToast('All data has been synchronized', 'success');
  };

  const handleAnnouncementDemo = () => {
    addToQueue('Low priority message', 'low');
    addToQueue('High priority alert!', 'high');
    addToQueue('Medium priority notification', 'medium');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.surface[0] }}>
      {/* Skip Links */}
      <SkipLink href="#main-content" onPress={() => announce('Skipped to main content')}>
        Skip to main content
      </SkipLink>
      <SkipLink href="#navigation" onPress={() => announce('Skipped to navigation')}>
        Skip to navigation
      </SkipLink>
      
      {/* Accessibility Debugger */}
      <AccessibilityDebugger visible={true} position="top-right" />

      <View style={{ padding: DESIGN_TOKENS.spacing.lg }}>
        <Landmark role="banner">
          <Text style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.xl,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.bold,
            color: theme.colors.gray[9],
            marginBottom: DESIGN_TOKENS.spacing.lg,
          }}>
            React UI Library Accessibility Demo
          </Text>
        </Landmark>

        <Landmark role="navigation" label="Main navigation">
          <Text style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.lg,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
            color: theme.colors.gray[8],
            marginBottom: DESIGN_TOKENS.spacing.md,
          }}>
            Keyboard Navigation Demo
          </Text>
          <Text style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.sm,
            color: theme.colors.gray[6],
            marginBottom: DESIGN_TOKENS.spacing.sm,
          }}>
            Use arrow keys, Home/End, Enter, or Escape
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: DESIGN_TOKENS.spacing.sm,
            marginBottom: DESIGN_TOKENS.spacing.lg,
          }}>
            {navigationItems.map((item, index) => (
              <Button
                key={item}
                title={item}
                variant={navigation.activeIndex === index ? 'filled' : 'secondary'}
                onPress={() => navigation.focusItem(index)}
              />
            ))}
          </View>
        </Landmark>

        <Landmark role="main" label="Main content">
          {/* Form Validation Demo */}
          <View style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <Text style={{
              fontSize: DESIGN_TOKENS.typography.fontSize.lg,
              fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
              color: theme.colors.gray[8],
              marginBottom: DESIGN_TOKENS.spacing.md,
            }}>
              Accessible Form Validation
            </Text>
            
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              onBlur={() => {
                emailValidation.markAsTouched();
                validateEmail();
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={emailValidation.hasErrors ? emailValidation.errors[0] : undefined}
              {...emailValidation.getAccessibilityProps()}
            />
            
            <Button
              title="Validate Email"
              onPress={validateEmail}
              style={{ marginTop: DESIGN_TOKENS.spacing.sm }}
            />
          </View>

          {/* Loading States Demo */}
          <View style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <Text style={{
              fontSize: DESIGN_TOKENS.typography.fontSize.lg,
              fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
              color: theme.colors.gray[8],
              marginBottom: DESIGN_TOKENS.spacing.md,
            }}>
              Accessible Loading States
            </Text>
            
            {isLoading && (
              <ProgressIndicator
                value={75}
                label="Data synchronization in progress"
                showPercentage={true}
              />
            )}
            
            <View style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
              <Button
                title={isLoading ? 'Loading...' : 'Start Loading Demo'}
                onPress={handleLoadingDemo}
                disabled={isLoading}
                {...getAccessibilityProps()}
              />
            </View>
          </View>

          {/* Announcement Queue Demo */}
          <View style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <Text style={{
              fontSize: DESIGN_TOKENS.typography.fontSize.lg,
              fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
              color: theme.colors.gray[8],
              marginBottom: DESIGN_TOKENS.spacing.md,
            }}>
              Announcement Queue Demo
            </Text>
            
            <Button
              title="Test Priority Announcements"
              onPress={handleAnnouncementDemo}
            />
          </View>

          {/* Toast Notifications */}
          <View style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <Text style={{
              fontSize: DESIGN_TOKENS.typography.fontSize.lg,
              fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
              color: theme.colors.gray[8],
              marginBottom: DESIGN_TOKENS.spacing.md,
            }}>
              Toast Notifications
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              gap: DESIGN_TOKENS.spacing.sm,
            }}>
              <Button
                title="Success Toast"
                onPress={() => showToast('Operation completed successfully!', 'success')}
                variant="secondary"
              />
              <Button
                title="Error Toast"
                onPress={() => showToast('Something went wrong. Please try again.', 'error')}
                variant="secondary"
              />
              <Button
                title="Warning Toast"
                onPress={() => showToast('Please review your settings.', 'warning')}
                variant="secondary"
              />
            </View>
          </View>

          {/* Focus Trap Demo */}
          <View style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <Text style={{
              fontSize: DESIGN_TOKENS.typography.fontSize.lg,
              fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
              color: theme.colors.gray[8],
              marginBottom: DESIGN_TOKENS.spacing.md,
            }}>
              Focus Trap Demo (Modal Simulation)
            </Text>
            
            <Button
              title="Open Modal with Focus Trap"
              onPress={() => setModalOpen(true)}
            />

            {modalOpen && (
              <View 
                ref={focusTrap.containerRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
                }}
              >
                <View style={{
                  backgroundColor: theme.colors.surface[0],
                  padding: DESIGN_TOKENS.spacing.lg,
                  borderRadius: DESIGN_TOKENS.radius.md,
                  width: '80%',
                  maxWidth: 400,
                }}>
                  <Text style={{
                    fontSize: DESIGN_TOKENS.typography.fontSize.lg,
                    fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
                    marginBottom: DESIGN_TOKENS.spacing.md,
                  }}>
                    Modal with Focus Trap
                  </Text>
                  
                  <Button
                    title="First Focusable Element"
                    variant="secondary"
                    style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}
                  />
                  
                  <Button
                    title="Second Focusable Element"
                    variant="secondary"
                    style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}
                  />
                  
                  <Button
                    title="Close Modal"
                    onPress={() => setModalOpen(false)}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Live Region Demo */}
          <LiveRegion priority="polite">
            <Text>{toasts.length > 0 ? toasts[toasts.length - 1].message : ''}</Text>
          </LiveRegion>

          {/* Testing Suite */}
          <AccessibilityTestSuite 
            onTestComplete={(results) => {
              announce(`Accessibility tests completed. ${Object.values(results).filter(Boolean).length} tests passed.`);
            }}
          />
        </Landmark>
      </View>
    </ScrollView>
  );
};