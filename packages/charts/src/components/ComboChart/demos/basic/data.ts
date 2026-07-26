export const LAYERS = [
	{
		type: 'bar' as const,
		id: 'revenue',
		name: 'Monthly revenue',
		data: [
			{ x: 1, y: 420 },
			{ x: 2, y: 455 },
			{ x: 3, y: 508 },
			{ x: 4, y: 480 },
			{ x: 5, y: 532 },
			{ x: 6, y: 575 },
		],
		opacity: 0.85,
	},
	{
		type: 'line' as const,
		id: 'active-users',
		name: 'Active users',
		targetAxis: 'right' as const,
		data: [
			{ x: 1, y: 110 },
			{ x: 2, y: 134 },
			{ x: 3, y: 149 },
			{ x: 4, y: 158 },
			{ x: 5, y: 166 },
			{ x: 6, y: 172 },
		],
		thickness: 3,
		showPoints: true,
		pointSize: 6,
	},
];
