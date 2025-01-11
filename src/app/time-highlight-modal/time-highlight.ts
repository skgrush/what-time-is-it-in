
export type IHexColor = `#${string}`;

export type ITimeHighlight = {
  readonly id: string;
  readonly start: number;
  readonly end: number;
  readonly hex: IHexColor;
};
