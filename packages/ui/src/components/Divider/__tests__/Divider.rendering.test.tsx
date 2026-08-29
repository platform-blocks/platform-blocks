import React from 'react';
import { render } from '@testing-library/react-native';

// `react-test-renderer` types aren't installed in this workspace; use a structural
// stand-in that matches what we read off the rendered tree (children + props.style).
type ReactTestInstance = {
	children: Array<ReactTestInstance | string | null>;
	props: Record<string, any>;
};

import { Divider } from '../Divider';

const palette = ['#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999'];

jest.mock('../../../core/theme/ThemeProvider', () => ({
	useTheme: () => ({
		colors: {
			surface: palette,
			primary: palette,
			secondary: palette,
			tertiary: palette,
			success: palette,
			warning: palette,
			error: palette,
			gray: palette
		},
		text: {
			primary: '#000000',
			muted: '#666666'
		},
		backgrounds: {
			base: '#FFFFFF',
			subtle: '#F7F8FA',
			surface: '#FFFFFF',
			border: '#d0d0d0'
		},
		spacing: (value: number) => value * 8,
		radius: (value: number) => value * 4
	})
}));

jest.mock('../../Text', () => {
	const React = require('react');
	const { Text: RNText } = require('react-native');
	return {
		Text: ({ children, ...rest }: any) => (
			<RNText {...rest}>{children}</RNText>
		)
	};
});

const flattenStyle = (style: any): Record<string, any> => {
	if (!style) return {};
	if (Array.isArray(style)) {
		return style.reduce((acc, item) => ({
			...acc,
			...flattenStyle(item)
		}), {});
	}
	if (typeof style === 'object') {
		return style;
	}
	return {};
};

const getChildInstances = (node: ReactTestInstance): ReactTestInstance[] =>
	node.children.filter((child): child is ReactTestInstance => typeof child !== 'string' && child !== null);

const getStyle = (node: ReactTestInstance) => flattenStyle(node.props.style);

describe('Divider - Rendering & Behavior', () => {
	it('renders a horizontal divider with default styles', () => {
		const { getByTestId } = render(<Divider testID="divider" />);
		const divider = getByTestId('divider');
		const containerStyle = flattenStyle(divider.props.style);

		expect(containerStyle.width).toBe('100%');

		const [line] = getChildInstances(divider);
		const lineStyle = flattenStyle(line.props.style);

		expect(lineStyle.borderTopWidth).toBe(1);
		expect(lineStyle.borderStyle).toBe('solid');
		expect(lineStyle.width).toBe('100%');
	});

	it('applies spacing props to the container', () => {
		const { getByTestId } = render(
			<Divider testID="divider" mt="lg" px="sm" />
		);
		const divider = getByTestId('divider');
		const containerStyle = flattenStyle(divider.props.style);

		expect(containerStyle.marginTop).toBe(16);
		expect(containerStyle.paddingLeft).toBe(8);
		expect(containerStyle.paddingRight).toBe(8);
	});

	it('supports size tokens for divider thickness', () => {
		const { getByTestId } = render(
			<Divider testID="divider" size="lg" />
		);
		const divider = getByTestId('divider');
		const [line] = getChildInstances(divider);
		const lineStyle = flattenStyle(line.props.style);

		expect(lineStyle.borderTopWidth).toBe(16);
		expect(lineStyle.height).toBe(16);
	});

	it('renders a vertical divider with correct styles', () => {
		const { getByTestId } = render(
			<Divider testID="divider" orientation="vertical" />
		);
		const divider = getByTestId('divider');
		const containerStyle = flattenStyle(divider.props.style);
		expect(containerStyle.height).toBe('100%');

		const [line] = getChildInstances(divider);
		const lineStyle = flattenStyle(line.props.style);
		expect(lineStyle.borderLeftWidth).toBe(1);
		expect(lineStyle.alignSelf).toBe('center');
	});

	it('renders labels and centers them by default', () => {
		const renderResult = render(
			<Divider testID="divider" label="Center" />
		);
		const { getByText, toJSON } = renderResult;

		expect(getByText('Center')).toBeTruthy();

		const tree = toJSON() as any;
		const wrapper = tree?.children?.[0];
		expect(wrapper).toBeTruthy();

		const wrapperStyle = flattenStyle(wrapper.props.style);
		expect(wrapperStyle.flexDirection).toBe('row');
		expect(wrapperStyle.alignItems).toBe('center');

		const wrapperChildren = (wrapper.children || []).filter(Boolean);
		const labelWrapper = wrapperChildren.find((child: any) => {
			const style = child?.props?.style ? flattenStyle(child.props.style) : {};
			return style.paddingHorizontal !== undefined;
		});
		const segments = wrapperChildren.filter((child: any) => {
			const style = child?.props?.style ? flattenStyle(child.props.style) : {};
			return style.borderTopWidth !== undefined;
		});

		expect(labelWrapper).toBeTruthy();
		expect(segments).toHaveLength(2);

		const labelWrapperStyle = flattenStyle(labelWrapper!.props.style);
		expect(labelWrapperStyle.paddingHorizontal).toBe(8);

		const [leftSegment, rightSegment] = segments;
		expect(flattenStyle(leftSegment.props.style).flex).toBe(1);
		expect(flattenStyle(rightSegment.props.style).flex).toBe(1);
	});

	it('respects label positioning for left and right segments', () => {
		const leftRender = render(
			<Divider testID="left-divider" label="Left" labelPosition="left" />
		);
		const leftTree = leftRender.toJSON() as any;
		const leftWrapper = leftTree?.children?.[0];
		const leftSegments = (leftWrapper?.children || []).filter((child: any) => {
			const style = child?.props?.style ? flattenStyle(child.props.style) : {};
			return style.borderTopWidth !== undefined;
		});
		const [leftSegmentLeft, leftSegmentRight] = leftSegments;

		expect(flattenStyle(leftSegmentLeft.props.style).flex).toBe(0.2);
		expect(flattenStyle(leftSegmentRight.props.style).flex).toBe(1);

		const rightRender = render(
			<Divider testID="right-divider" label="Right" labelPosition="right" />
		);
		const rightTree = rightRender.toJSON() as any;
		const rightWrapper = rightTree?.children?.[0];
		const rightSegments = (rightWrapper?.children || []).filter((child: any) => {
			const style = child?.props?.style ? flattenStyle(child.props.style) : {};
			return style.borderTopWidth !== undefined;
		});
		const [rightSegmentLeft, rightSegmentRight] = rightSegments;

		expect(flattenStyle(rightSegmentLeft.props.style).flex).toBe(1);
		expect(flattenStyle(rightSegmentRight.props.style).flex).toBe(0.2);
	});

	it('renders vertical labels centered within the stack', () => {
		const renderResult = render(
			<Divider testID="divider" orientation="vertical" label="Vertical" />
		);
		const { getByText, toJSON } = renderResult;

		expect(getByText('Vertical')).toBeTruthy();

		const tree = toJSON() as any;
		const wrapper = tree?.children?.[0];
		expect(wrapper).toBeTruthy();

		const wrapperStyle = flattenStyle(wrapper.props.style);
		expect(wrapperStyle.flexDirection).toBe('column');
		expect(wrapperStyle.alignItems).toBe('center');

		const wrapperChildren = (wrapper.children || []).filter(Boolean);
		const labelWrapper = wrapperChildren.find((child: any) => {
			const style = child?.props?.style ? flattenStyle(child.props.style) : {};
			return style.paddingVertical !== undefined;
		});

		expect(labelWrapper).toBeTruthy();

		const labelWrapperStyle = flattenStyle(labelWrapper!.props.style);
		expect(labelWrapperStyle.alignItems).toBe('center');
		expect(labelWrapperStyle.alignSelf).toBe('center');
	});

	it('applies variant border styles', () => {
		const { getByTestId } = render(
			<Divider testID="divider" variant="dashed" />
		);
		const divider = getByTestId('divider');
		const [line] = getChildInstances(divider);
		const lineStyle = flattenStyle(line.props.style);

		expect(lineStyle.borderStyle).toBe('dashed');
	});

	it('uses a soft palette shade (3) for a palette color — tuned for separators', () => {
		const { getByTestId } = render(
			<Divider testID="divider" color="primary" />
		);
		const divider = getByTestId('divider');
		const [line] = getChildInstances(divider);
		const lineStyle = flattenStyle(line.props.style);

		expect(lineStyle.borderTopColor).toBe(palette[3]);
	});

	it('forwards opacity prop to the wrapping View style', () => {
		const { getByTestId } = render(
			<Divider testID="divider" opacity={0.4} />
		);
		const divider = getByTestId('divider');
		const containerStyle = flattenStyle(divider.props.style);
		expect(containerStyle.opacity).toBe(0.4);
	});

	it('defaults to theme.backgrounds.border when no color is supplied', () => {
		const { getByTestId } = render(<Divider testID="divider" />);
		const divider = getByTestId('divider');
		const [line] = getChildInstances(divider);
		const lineStyle = flattenStyle(line.props.style);
		// mockTheme.backgrounds.border below
		expect(lineStyle.borderTopColor).toBe('#d0d0d0');
	});
});

