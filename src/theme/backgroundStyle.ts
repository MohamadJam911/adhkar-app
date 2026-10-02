// ==========================================
// Screen background switch — three options
// ==========================================
//   'classic'   ← the original background (diamond and circle grid), no extra shadows
//   'courtyard' ← "lit courtyard": gradient with light from the top, faint
//                 interlocking circles fading downwards, a mihrab arch and warm card shadows
//   'girih'     ← eight-point star girih pattern, very low opacity, fading
//                 downwards; slightly darker beige with white cards, a tint that
//                 follows the prayer times, and subtle parallax
// Change the value here; an `eas update` is enough.
export type BackgroundStyle = 'classic' | 'courtyard' | 'girih';
export const BACKGROUND_STYLE: BackgroundStyle = 'courtyard';
