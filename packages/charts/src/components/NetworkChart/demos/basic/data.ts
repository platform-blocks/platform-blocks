export const NODES = [
	{ id: 'product', name: 'Product', group: 'teams', value: 12 },
	{ id: 'design', name: 'Design', group: 'teams', value: 8 },
	{ id: 'engineering', name: 'Engineering', group: 'teams', value: 18 },
	{ id: 'marketing', name: 'Marketing', group: 'teams', value: 10 },
	{ id: 'sales', name: 'Sales', group: 'teams', value: 9 },
	{ id: 'support', name: 'Support', group: 'teams', value: 7 },
	{ id: 'platform', name: 'Platform', group: 'initiatives', value: 15 },
	{ id: 'ai', name: 'AI', group: 'initiatives', value: 11 },
];

export const LINKS = [
	{ source: 'platform', target: 'engineering', value: 6 },
	{ source: 'platform', target: 'product', value: 5 },
	{ source: 'platform', target: 'support', value: 2 },
	{ source: 'ai', target: 'product', value: 4 },
	{ source: 'ai', target: 'marketing', value: 3 },
	{ source: 'ai', target: 'sales', value: 2 },
	{ source: 'product', target: 'design', value: 7 },
	{ source: 'product', target: 'engineering', value: 8 },
	{ source: 'marketing', target: 'sales', value: 5 },
	{ source: 'support', target: 'sales', value: 4 },
];
