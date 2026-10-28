export interface Question {
    id:string;
    category:string;
    question:string;
    correct_answer:string;
    distractors?:string[];
}

export const BOT_NAMES = [
    "Adam",
    "Michał",
    "Kamil",
    "Tomasz",
    "Piotr",
    "Paweł",
    "Mateusz",
    "Jakub",
    "Patryk",
    "Marcin",
    "Szymon",
    "Bartosz",
    "Łukasz",
    "Dawid",
    "Maciej",
    "Filip",
    "Jan",
    "Marek",
    "Antoni",
    "Oskar",
    "Julia",
    "Anna",
    "Katarzyna",
    "Aleksandra",
    "Natalia",
    "Karolina",
    "Magdalena",
    "Paulina",
    "Weronika",
    "Zuzanna",
    "Emilia",
    "Maria",
];

export interface Player {
    id: number;
    name: string;
    color: PlayerColor;
}

export function generateBotName(bots:number):string[] {
   const names:string[] = [...BOT_NAMES]

   for (let i  = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
   }

   return names.slice(0,bots);
}

export function getSex(name:string): 'male' | 'female' {
    if(name[name.length-1] === "a") return "female"
    return "male"
}

export type PlayerColor =  "red" | "green" | "blue" | "indigo" | "orange" | "purple" | "pink" | "cyan" | "magenta" | "brown" | "gray" | "teal";

export const PLAYER_COLORS: PlayerColor[] = ["red", "green", "blue", "indigo", "orange", "purple", "pink", "cyan", "magenta", "brown", "gray", "teal"];

export function randomColor(): PlayerColor {
    return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

export function darkenColor(hex?: string, amount = 40): string {
    if (!hex || !hex.startsWith("#")) {
        return "#1d4ed8";
    }

    const num = parseInt(hex.slice(1), 16);

    if (isNaN(num)) {
        return "#1d4ed8";
    }

    const r = Math.max((num >> 16) - amount, 0);
    const g = Math.max(((num >> 8) & 0xff) - amount, 0);
    const b = Math.max((num & 0xff) - amount, 0);

    return `rgb(${r}, ${g}, ${b})`;
}

export const colorClasses: Record<PlayerColor, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  magenta: "bg-fuchsia-500",
  brown: "bg-amber-800",
  gray: "bg-gray-500",
  teal: "bg-teal-500",
};

