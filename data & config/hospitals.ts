export type Hospital = {
  name: string;
  type: "government" | "phc" | "relief_camp" | "private";
  phone: string;
};

/** Mock hospital + relief-camp directory keyed by district id. */
export const HOSPITALS: Record<string, Hospital[]> = {
  kamrup_metro: [
    { name: "GMCH Guwahati", type: "government", phone: "0361 252 9457" },
    { name: "Mahendra Mohan Choudhury Hospital", type: "government", phone: "0361 251 3415" },
    { name: "Downtown Hospital", type: "private", phone: "0361 233 1003" },
  ],
  kamrup: [
    { name: "Amingaon Civil Hospital", type: "government", phone: "0361 268 5021" },
    { name: "Boko PHC", type: "phc", phone: "0361 268 7124" },
  ],
  dibrugarh: [
    { name: "Assam Medical College & Hospital", type: "government", phone: "0373 230 0080" },
    { name: "Lahowal PHC", type: "phc", phone: "0373 237 1245" },
  ],
  cachar: [
    { name: "Silchar Medical College", type: "government", phone: "0384 226 2052" },
    { name: "Kanakpur Relief Camp", type: "relief_camp", phone: "108" },
  ],
  jorhat: [
    { name: "Jorhat Medical College", type: "government", phone: "0376 230 5023" },
    { name: "Titabor PHC", type: "phc", phone: "0376 245 1147" },
  ],
  nagaon: [
    { name: "Nagaon Civil Hospital", type: "government", phone: "0367 222 2444" },
    { name: "Kaliabor PHC", type: "phc", phone: "0367 224 1019" },
  ],
  majuli: [
    { name: "Garamur PHC", type: "phc", phone: "0376 327 4012" },
    { name: "Kamalabari Relief Camp", type: "relief_camp", phone: "108" },
  ],
  dhubri: [
    { name: "Dhubri Civil Hospital", type: "government", phone: "0366 223 0451" },
    { name: "Bilasipara PHC", type: "phc", phone: "0366 226 8011" },
  ],
  lakhimpur: [
    { name: "North Lakhimpur Civil Hospital", type: "government", phone: "0375 224 2222" },
    { name: "Bihpuria Relief Camp", type: "relief_camp", phone: "108" },
  ],
  barpeta: [
    { name: "Fakhruddin Ali Ahmed Medical College", type: "government", phone: "0366 625 5252" },
    { name: "Sarthebari PHC", type: "phc", phone: "0366 624 8011" },
  ],
};

const DEFAULT_HOSPITALS: Hospital[] = [
  { name: "District Civil Hospital", type: "government", phone: "108" },
  { name: "Block PHC", type: "phc", phone: "108" },
  { name: "Flood Relief Camp", type: "relief_camp", phone: "108" },
];

export function hospitalsFor(districtId: string): Hospital[] {
  return HOSPITALS[districtId] ?? DEFAULT_HOSPITALS;
}

export const EMERGENCY_NUMBERS = {
  ambulance: "108",
  disaster: "1077",
  health: "104",
};