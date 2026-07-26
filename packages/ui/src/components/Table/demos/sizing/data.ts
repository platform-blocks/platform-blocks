export const columns = [
  { key: 'name', minWidth: 140 },
  { key: 'email', flex: 2, minWidth: 200 },
  { key: 'plan', width: 90 },
  { key: 'usage', flex: 1, minWidth: 120 },
];

export const data = {
  head: ['Name', 'Email', 'Plan', 'Usage'],
  body: [
    ['Alice Carter', 'alice@example.com', 'Pro', '13.4 GB'],
    ['Brandon Lee', 'brandon@example.com', 'Free', '1.1 GB'],
    ['Chloe Mills', 'chloe@example.com', 'Business', '54.2 GB'],
    ['Daniel Stone', 'daniel@example.com', 'Pro', '8.7 GB'],
  ],
  caption: 'Responsive column sizing configuration',
};
