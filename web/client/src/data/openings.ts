export type OpeningFamily = {
  id: string;
  eco: string;
  name: string;
  moves: string;
  uci: string[];
  aliases: string[];
  character: string;
  whitePlan: string;
  blackPlan: string;
};

export type EcoVolume = "A" | "B" | "C" | "D" | "E";

export const ecoVolumes: Array<{ id: EcoVolume; label: string; range: string }> = [
  { id: "A", label: "Flank & irregular", range: "A00–A99" },
  { id: "B", label: "Semi-open e4", range: "B00–B99" },
  { id: "C", label: "Open & French", range: "C00–C99" },
  { id: "D", label: "Closed & semi-closed", range: "D00–D99" },
  { id: "E", label: "Indian systems", range: "E00–E99" },
];

export const openingFamilies: OpeningFamily[] = [
  {
    id: "italian-game",
    eco: "C50-C59",
    name: "Italian Game",
    moves: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
    uci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
    aliases: ["Giuoco Piano", "Two Knights"],
    character: "Fast development around the f7 square, with both tactical and quiet positional branches.",
    whitePlan: "Castle quickly, prepare c3 and d4, and keep pressure on the center and kingside.",
    blackPlan: "Challenge the center with ...Nf6 and ...d5 or build a solid ...Bc5, ...d6 structure.",
  },
  {
    id: "ruy-lopez",
    eco: "C60-C99",
    name: "Ruy Lopez",
    moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
    uci: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
    aliases: ["Spanish Opening", "Spanish Game"],
    character: "A deep fight over e5 where long-term pressure, piece coordination, and pawn breaks matter more than immediate tactics.",
    whitePlan: "Preserve central tension, improve pieces, and prepare d4 while using the bishop to pressure c6 and e5.",
    blackPlan: "Develop actively, question the bishop with ...a6, and seek ...d5 or queenside counterplay.",
  },
  {
    id: "sicilian-defense",
    eco: "B20-B99",
    name: "Sicilian Defense",
    moves: "1. e4 c5",
    uci: ["e2e4", "c7c5"],
    aliases: ["Najdorf", "Dragon", "Scheveningen", "Sveshnikov", "Classical Sicilian"],
    character: "Black creates an asymmetrical pawn structure immediately and trades central symmetry for active counterplay.",
    whitePlan: "Use the space advantage to develop quickly, control d5, and choose a plan based on the specific Sicilian structure.",
    blackPlan: "Pressure the c-file and d4, expand on the queenside, and time central breaks accurately.",
  },
  {
    id: "french-defense",
    eco: "C00-C19",
    name: "French Defense",
    moves: "1. e4 e6 2. d4 d5",
    uci: ["e2e4", "e7e6", "d2d4", "d7d5"],
    aliases: ["Winawer", "Tarrasch French", "Advance French", "Classical French"],
    character: "Closed and semi-closed structures where Black attacks the white center and White often gains kingside space.",
    whitePlan: "Support the e5 chain, exploit kingside space, and watch the pressure against d4.",
    blackPlan: "Attack the pawn chain with ...c5 and often ...f6, while solving the light-squared bishop.",
  },
  {
    id: "caro-kann",
    eco: "B10-B19",
    name: "Caro-Kann Defense",
    moves: "1. e4 c6 2. d4 d5",
    uci: ["e2e4", "c7c6", "d2d4", "d7d5"],
    aliases: ["Classical Caro-Kann", "Advance Caro-Kann", "Panov Attack"],
    character: "A resilient defense that challenges e4 without locking in Black's light-squared bishop.",
    whitePlan: "Use space and development to keep the initiative before Black completes the setup.",
    blackPlan: "Complete development with a healthy structure, then challenge White's center with timely breaks.",
  },
  {
    id: "scandinavian-defense",
    eco: "B01",
    name: "Scandinavian Defense",
    moves: "1. e4 d5",
    uci: ["e2e4", "d7d5"],
    aliases: ["Center Counter Defense"],
    character: "Black challenges e4 on move one and accepts early queen exposure in return for direct central play.",
    whitePlan: "Develop with tempo while keeping a stable central edge.",
    blackPlan: "Recover development quickly and build pressure on d4 and the central light squares.",
  },
  {
    id: "pirc-modern",
    eco: "B06-B09",
    name: "Pirc and Modern Defenses",
    moves: "1. e4 d6 2. d4 Nf6 3. Nc3 g6",
    uci: ["e2e4", "d7d6", "d2d4", "g8f6", "b1c3", "g7g6"],
    aliases: ["Pirc Defense", "Modern Defense"],
    character: "Hypermodern setups that let White occupy the center before attacking it with pieces and pawn breaks.",
    whitePlan: "Use the broad center to gain space, but avoid overextending before development is complete.",
    blackPlan: "Pressure the center with ...Bg7, ...c5, or ...e5 and strike when White's pawn chain becomes a target.",
  },
  {
    id: "queens-gambit",
    eco: "D06-D69",
    name: "Queen's Gambit",
    moves: "1. d4 d5 2. c4",
    uci: ["d2d4", "d7d5", "c2c4"],
    aliases: ["Queen's Gambit Declined", "Queen's Gambit Accepted", "QGD", "QGA"],
    character: "A classical challenge to Black's d5 pawn that leads to rich isolated-pawn, hanging-pawn, and minority-attack structures.",
    whitePlan: "Pressure d5, develop smoothly, and use c-file or queenside space depending on the structure.",
    blackPlan: "Maintain or release the central tension at the right moment and activate the light-squared bishop.",
  },
  {
    id: "slav-defense",
    eco: "D10-D19",
    name: "Slav Defense",
    moves: "1. d4 d5 2. c4 c6",
    uci: ["d2d4", "d7d5", "c2c4", "c7c6"],
    aliases: ["Semi-Slav", "Chebanenko Slav"],
    character: "A solid Queen's Gambit defense that supports d5 with a c-pawn while preserving the light-squared bishop.",
    whitePlan: "Use development and central pressure to make Black commit before choosing a pawn break.",
    blackPlan: "Hold the center, develop the bishop actively, and seek ...c5 or ...e5 under favorable conditions.",
  },
  {
    id: "kings-indian",
    eco: "E60-E99",
    name: "King's Indian Defense",
    moves: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6",
    uci: ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "f8g7", "e2e4", "d7d6"],
    aliases: ["KID", "Mar del Plata", "Saemisch", "Fianchetto King's Indian"],
    character: "Black gives White central space and aims for dynamic pawn breaks and kingside counterplay.",
    whitePlan: "Use the center and queenside space while staying alert to Black's kingside attack.",
    blackPlan: "Prepare ...e5 or ...c5, then attack the base and flanks of White's pawn center.",
  },
  {
    id: "nimzo-indian",
    eco: "E20-E59",
    name: "Nimzo-Indian Defense",
    moves: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4",
    uci: ["d2d4", "g8f6", "c2c4", "e7e6", "b1c3", "f8b4"],
    aliases: ["Nimzo"],
    character: "Black pins the c3 knight and fights for central control with flexible pawn structures and active pieces.",
    whitePlan: "Use the bishop pair or central space as compensation when structural concessions appear.",
    blackPlan: "Pressure c3 and e4, exploit doubled pawns when relevant, and stay flexible with ...d5 or ...c5.",
  },
  {
    id: "queens-indian",
    eco: "E12-E19",
    name: "Queen's Indian Defense",
    moves: "1. d4 Nf6 2. c4 e6 3. Nf3 b6",
    uci: ["d2d4", "g8f6", "c2c4", "e7e6", "g1f3", "b7b6"],
    aliases: ["QID"],
    character: "A restrained hypermodern defense focused on controlling e4 and developing harmoniously.",
    whitePlan: "Claim space without allowing Black to dominate the light squares.",
    blackPlan: "Use ...Bb7 and central breaks to pressure e4 and neutralize White's space.",
  },
  {
    id: "grunfeld-defense",
    eco: "D70-D99",
    name: "Grünfeld Defense",
    moves: "1. d4 Nf6 2. c4 g6 3. Nc3 d5",
    uci: ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "d7d5"],
    aliases: ["Grunfeld", "Exchange Grünfeld"],
    character: "Black immediately attacks White's center and often permits a large pawn center in order to undermine it.",
    whitePlan: "Use the central pawns actively while coordinating pieces to support their advance.",
    blackPlan: "Attack the center with ...c5, ...Bg7, and piece pressure before White consolidates.",
  },
  {
    id: "english-opening",
    eco: "A10-A39",
    name: "English Opening",
    moves: "1. c4",
    uci: ["c2c4"],
    aliases: ["Symmetrical English", "Four Knights English", "Botvinnik System"],
    character: "A flexible flank opening that can transpose into many queen-pawn structures while controlling d5 from the side.",
    whitePlan: "Use flexible development, queenside space, and carefully timed central breaks.",
    blackPlan: "Choose between symmetry, a reversed Sicilian structure, or a direct central occupation.",
  },
  {
    id: "london-system",
    eco: "D02",
    name: "London System",
    moves: "1. d4 d5 2. Nf3 Nf6 3. Bf4",
    uci: ["d2d4", "d7d5", "g1f3", "g8f6", "c1f4"],
    aliases: ["London"],
    character: "A compact setup built around Bf4, e3, c3, and stable development rather than forcing early theory.",
    whitePlan: "Complete the setup efficiently, then choose between e4, c4, or kingside play based on Black's structure.",
    blackPlan: "Challenge the dark-squared bishop and attack the center before White gets a free ideal setup.",
  },
  {
    id: "dutch-defense",
    eco: "A80-A99",
    name: "Dutch Defense",
    moves: "1. d4 f5",
    uci: ["d2d4", "f7f5"],
    aliases: ["Leningrad Dutch", "Stonewall Dutch", "Classical Dutch"],
    character: "Black grabs kingside space and controls e4 at the cost of loosening the king position.",
    whitePlan: "Pressure the dark squares and center while avoiding an unchecked kingside initiative.",
    blackPlan: "Use the f-pawn space to support ...e5 or a kingside attack while keeping the king safe.",
  },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getOpeningFamilyById(id: string) {
  return openingFamilies.find((opening) => opening.id === id) ?? null;
}

export function searchOpeningFamilies(query: string) {
  const needle = normalize(query.trim());
  if (!needle) return openingFamilies;

  return openingFamilies.filter((opening) => {
    const searchable = [opening.eco, opening.name, opening.moves, ...opening.aliases].map(normalize).join(" ");
    return searchable.includes(needle);
  });
}

export function filterOpeningFamiliesByEcoVolume(openings: OpeningFamily[], volume: EcoVolume | "all") {
  if (volume === "all") return openings;
  return openings.filter((opening) => opening.eco.startsWith(volume));
}
