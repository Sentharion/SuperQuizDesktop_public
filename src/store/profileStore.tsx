import { create } from "zustand";
import {persist,createJSONStorage} from "zustand/middleware";

export type ProfileStore = {
    avatarUrl:string | null;
    username:string;
    highestScore:number;
    wins: number;

    updateAvatar:(url:string|null) => void;
    updateUsername:(username:string) => void;
    updateHighestScore:(score:number) => void;
    updateWins:(wins:number) => void;
};

export const useProfileStore = create<ProfileStore>()(persist((set) => ({
    avatarUrl: null,
    username: "Gracz",
    highestScore: 0,
    wins: 0,

    updateAvatar:(url) => set({avatarUrl:url}),
    updateUsername:(username) => set({username}),
    updateHighestScore:(score) => set({highestScore:score}),
    updateWins:(wins) => set({wins}),
}), {
    name:"profile-store",
    storage:createJSONStorage(()=>localStorage)
}));