import { Demo } from '../demos/basic';
import { expectChartDemo } from '../../../__web_tests__/chartDemoHarness';

test('renders its published demo as web SVG with visible marks', () => {
  expectChartDemo(Demo, 'Customer satisfaction distribution');
});
