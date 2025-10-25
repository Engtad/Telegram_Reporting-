export function metersToFeet(m: number) {
  return m * 3.28084;
}
export function feetToMeters(ft: number) {
  return ft / 3.28084;
}
export function inchesToCm(inch: number) {
  return inch * 2.54;
}
export function cmToInches(cm: number) {
  return cm / 2.54;
}
export function kgToPounds(kg: number) {
  return kg * 2.20462;
}
export function poundsToKg(lb: number) {
  return lb / 2.20462;
}
export function barToPsi(bar: number) {
  return bar * 14.5038;
}
export function psiToBar(psi: number) {
  return psi / 14.5038;
}
export function cToF(c: number) {
  return c * 9 / 5 + 32;
}
export function fToC(f: number) {
  return (f - 32) * 5 / 9;
}

export function unitsMarkdownReference(): string {
  return [
    '*Units Reference*',
    '- Length: 1 m = 3.2808 ft | 1 in = 2.54 cm',
    '- Weight: 1 kg = 2.2046 lb',
    '- Pressure: 1 bar = 14.5038 psi',
    '- Temperature: °F = °C × 9/5 + 32'
  ].join('\n');
}

export function dualLength(m: number) {
  return `${m.toFixed(2)} m (${metersToFeet(m).toFixed(2)} ft)`;
}
export function dualWeight(kg: number) {
  return `${kg.toFixed(2)} kg (${kgToPounds(kg).toFixed(2)} lb)`;
}
export function dualPressure(bar: number) {
  return `${bar.toFixed(2)} bar (${barToPsi(bar).toFixed(2)} psi)`;
}
export function dualTempC(c: number) {
  return `${c.toFixed(1)} °C (${cToF(c).toFixed(1)} °F)`;
}
