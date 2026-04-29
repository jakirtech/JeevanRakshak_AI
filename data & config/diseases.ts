export type DiseaseId =
  | "cholera"
  | "typhoid"
  | "diarrhea"
  | "hepatitis_a"
  | "malaria"
  | "dengue"
  | "japanese_encephalitis"
  | "leptospirosis"
  | "chikungunya"
  | "skin_infection";

export type DiseaseInfo = {
  id: DiseaseId;
  name: string;
  family: "waterborne" | "vector" | "skin";
  incubationDays: [number, number];
  symptoms: SymptomId[];
  prevention: string[];
};

export type SymptomId =
  | "fever"
  | "vomiting"
  | "diarrhea"
  | "fatigue"
  | "headache"
  | "body_ache"
  | "abdominal_pain"
  | "dehydration"
  | "jaundice"
  | "chills"
  | "rash"
  | "cough";

export const SYMPTOMS: { id: SymptomId; icon: string }[] = [
  { id: "fever", icon: "thermometer" },
  { id: "vomiting", icon: "alert-octagon" },
  { id: "diarrhea", icon: "droplet" },
  { id: "fatigue", icon: "battery" },
  { id: "headache", icon: "frown" },
  { id: "body_ache", icon: "user" },
  { id: "abdominal_pain", icon: "minus-circle" },
  { id: "dehydration", icon: "cloud-drizzle" },
  { id: "jaundice", icon: "sun" },
  { id: "chills", icon: "cloud-snow" },
  { id: "rash", icon: "circle" },
  { id: "cough", icon: "wind" },
];

export const DISEASES: Record<DiseaseId, DiseaseInfo> = {
  cholera: {
    id: "cholera",
    name: "Cholera",
    family: "waterborne",
    incubationDays: [1, 5],
    symptoms: ["diarrhea", "vomiting", "dehydration", "abdominal_pain"],
    prevention: [
      "Drink only boiled or chlorinated water",
      "Use ORS at first sign of diarrhea",
      "Wash hands with soap before meals",
    ],
  },
  typhoid: {
    id: "typhoid",
    name: "Typhoid",
    family: "waterborne",
    incubationDays: [6, 30],
    symptoms: ["fever", "headache", "abdominal_pain", "fatigue"],
    prevention: [
      "Avoid street food in flood-affected zones",
      "Boil drinking water for 1 minute",
      "Vaccinate when outbreak is declared",
    ],
  },
  diarrhea: {
    id: "diarrhea",
    name: "Acute Diarrhea",
    family: "waterborne",
    incubationDays: [1, 3],
    symptoms: ["diarrhea", "abdominal_pain", "dehydration"],
    prevention: [
      "ORS within 4 hours of symptom",
      "Avoid raw vegetables washed in flood water",
      "Hand hygiene after every contact",
    ],
  },
  hepatitis_a: {
    id: "hepatitis_a",
    name: "Hepatitis A / E",
    family: "waterborne",
    incubationDays: [15, 50],
    symptoms: ["jaundice", "fatigue", "abdominal_pain", "fever"],
    prevention: [
      "Safe water and sanitation",
      "Avoid uncooked seafood",
      "Vaccinate children in flood camps",
    ],
  },
  malaria: {
    id: "malaria",
    name: "Malaria",
    family: "vector",
    incubationDays: [7, 30],
    symptoms: ["fever", "chills", "headache", "fatigue"],
    prevention: [
      "Sleep under insecticide-treated nets",
      "Drain stagnant water around homes",
      "Indoor residual spraying",
    ],
  },
  dengue: {
    id: "dengue",
    name: "Dengue",
    family: "vector",
    incubationDays: [4, 10],
    symptoms: ["fever", "body_ache", "rash", "headache"],
    prevention: [
      "Empty water containers weekly",
      "Wear long sleeves at dawn and dusk",
      "Use mosquito repellent on skin",
    ],
  },
  japanese_encephalitis: {
    id: "japanese_encephalitis",
    name: "Japanese Encephalitis",
    family: "vector",
    incubationDays: [5, 15],
    symptoms: ["fever", "headache", "vomiting", "fatigue"],
    prevention: [
      "JE vaccination for children 1-15",
      "Pig sty distancing from homes",
      "Mosquito control near paddy fields",
    ],
  },
  leptospirosis: {
    id: "leptospirosis",
    name: "Leptospirosis",
    family: "waterborne",
    incubationDays: [2, 30],
    symptoms: ["fever", "body_ache", "headache", "jaundice"],
    prevention: [
      "Avoid wading in flood water without boots",
      "Cover open wounds before exposure",
      "Doxycycline prophylaxis for relief workers",
    ],
  },
  chikungunya: {
    id: "chikungunya",
    name: "Chikungunya",
    family: "vector",
    incubationDays: [3, 7],
    symptoms: ["fever", "body_ache", "rash"],
    prevention: [
      "Source reduction of mosquito breeding",
      "Repellents and full-sleeve clothing",
      "Cover water storage tanks",
    ],
  },
  skin_infection: {
    id: "skin_infection",
    name: "Skin Infection",
    family: "skin",
    incubationDays: [1, 7],
    symptoms: ["rash", "fatigue"],
    prevention: [
      "Dry skin completely after wading",
      "Use antifungal powder in groin and feet",
      "Avoid sharing towels in relief camps",
    ],
  },
};

export const DISEASE_LIST: DiseaseInfo[] = Object.values(DISEASES);