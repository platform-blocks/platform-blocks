export const NODES = [
	{ id: 'solar', name: 'Solar' },
	{ id: 'wind', name: 'Wind' },
	{ id: 'hydro', name: 'Hydro' },
	{ id: 'grid', name: 'Grid' },
	{ id: 'battery', name: 'Battery Storage' },
	{ id: 'residential', name: 'Residential' },
	{ id: 'commercial', name: 'Commercial' },
	{ id: 'industrial', name: 'Industrial' },
];

export const LINKS = [
	{ source: 'solar', target: 'grid', value: 32 },
	{ source: 'wind', target: 'grid', value: 28 },
	{ source: 'hydro', target: 'grid', value: 18 },
	{ source: 'solar', target: 'battery', value: 6 },
	{ source: 'wind', target: 'battery', value: 4 },
	{ source: 'battery', target: 'grid', value: 8 },
	{ source: 'grid', target: 'residential', value: 30 },
	{ source: 'grid', target: 'commercial', value: 24 },
	{ source: 'grid', target: 'industrial', value: 16 },
];
