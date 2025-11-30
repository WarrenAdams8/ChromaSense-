export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface PaletteResult {
  dominant: string; // Hex
  palette: string[]; // Array of Hex
}
