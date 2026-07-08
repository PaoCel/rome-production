// Static owners for the MVP. Later these could come from Firestore users.
export const OWNERS = ['Paolo', 'Daniele', 'Mirko'] as const;

export type Owner = (typeof OWNERS)[number];
