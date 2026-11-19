export const money = (n: number) =>
  `$${n.toFixed(n % 1 ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
