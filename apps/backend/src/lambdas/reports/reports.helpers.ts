export function sortMonthsDescending(
  entryA: [string, unknown],
  entryB: [string, unknown]
): number {
  const [monthA] = entryA;
  const [monthB] = entryB;

  if (monthA > monthB) return -1;
  if (monthA < monthB) return 1;

  return 0;
}
