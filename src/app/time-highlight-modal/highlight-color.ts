/**
 * @fileOverview
 *
 * RGB is a 3D (r,g,b) coordinate space.
 * we want colors where all three segments are not too close to each other
 *    ^ this means we're avoiding the (0,0,0) end and the (FF,FF,FF) ends
 *
 *    What if we try to stay inside the sphere centered at (0x80,0x80,0x80) ?
 */
import { IHexColor } from './time-highlight';


const hexCenter = 0x80;
const hexCenterStr = hexCenter.toString(16).padStart(2, '0');

/**
 * first try: naively map start to R and end to G, keep B in the middle
 *
 * to map a [0, 24] to cosine outputs [-1,1] uniquely, we need to convert the [0,24] [0, pi/2]
 */
export function pickAColorForRangeV1(start: number, end: number) {
  const rZeroTo1 = Math.cos(start / 24 * Math.PI / 2);
  const gZeroTo1 = Math.cos(end / 24 * Math.PI / 2);

  const r = (rZeroTo1 * 0xFF | 0).toString(16).padStart(2, '0');
  const g = (gZeroTo1 * 0xFF | 0).toString(16).padStart(2, '0');

  debugger;
  return `#${r}${g}${hexCenterStr}` as IHexColor;

  // what if we tried to stay inside the sphere centered at (80,80,80)?

  // first try:
}
