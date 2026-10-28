import { UserRound, Pencil, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfileStore, type ProfileStore } from "../store/profileStore";
import { useState, useRef } from "react";

export default function ProfileScreen() {
    const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
    const navigate = useNavigate();
    const image = useProfileStore((state: ProfileStore) => state.avatarUrl);
    const updateAvatar = useProfileStore((state: ProfileStore) => state.updateAvatar);
    const username = useProfileStore((state: ProfileStore) => state.username);
    const updateUsername = useProfileStore((state: ProfileStore) => state.updateUsername);
    const highestScore = useProfileStore((state: ProfileStore) => state.highestScore);
    const wins = useProfileStore((state: ProfileStore) => state.wins);
    const [usernameDraft, setUsernameDraft] = useState<string>(username);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const handleEditPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarDraft(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    const handleSave = () => {
        if(avatarDraft){
            updateAvatar(avatarDraft);
        }
        if(usernameDraft !== username){
            updateUsername(usernameDraft);
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    }

    return (
        <div className="flex flex-col w-full px-4 pb-10">
            <button onClick={() => navigate(-1)} className="bg-primary p-3 rounded-xl flex gap-2 items-center justify-center w-36 hover:bg-primary/80 transition-colors duration-200 hover:cursor-pointer sm:absolute sm:top-5 sm:left-5 mx-auto sm:mx-0 mb-4 sm:mb-0">
                <ArrowLeft color="white" size={20} />
                <p className="text-white text-center font-semibold">
                    Powrót
                </p>
            </button>
            <div className={`absolute left-1/2 top-36 -translate-x-1/2 rounded-xl p-2 transition-opacity duration-200 ${isSaved ? "opacity-100" : "opacity-0"}`}>
                <p className="text-green-700 text-center font-semibold text-lg">Zapisano zmiany!</p>
            </div>
            <div className="bg-backgroundLight p-5 rounded-lg border border-border mx-auto mt-4 sm:mt-20 lg:mt-50 px-6 sm:px-12 lg:px-16 py-8 w-full sm:w-4/5 md:w-3/5 lg:w-2/5 justify-center">
                <p className="text-2xl font-bold text-white text-center">
                    Edytuj swój profil
                </p>
                <div className="flex justify-center items-center my-3">
                    <div className="relative w-24 h-24 rounded-full bg-border border-2 border-borderHover flex justify-center items-center">

                        {avatarDraft || image ? (
                            <img
                                src={avatarDraft ?? image ?? ""}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <UserRound color="white" size={48} />
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhoto}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 transition-colors duration-200 hover:bg-green-700 hover:cursor-pointer rounded-full flex justify-center items-center"
                        >
                            <Pencil color="white" size={15} />
                        </button>

                    </div>
                </div>
                <div className="flex flex-col justify-center items-center gap-3">
                    <div className="flex flex-col gap-3 items-center justify-center">
                        <p className="text-muted text-md">Nazwa użytkownika</p>
                        <input
                            placeholder="Nazwa użytkownika"
                            value={usernameDraft}
                            onChange={(e) => setUsernameDraft(e.target.value)}
                            className="border border-border rounded-lg p-2 w-full text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button className="bg-green-600 mx-auto p-3 rounded-xl w-full transition-colors duration-200 hover:bg-green-700 hover:cursor-pointer" onClick={handleSave}>
                            <p className="text-white text-center font-semibold">
                                Zapisz
                            </p>
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-backgroundLight p-5 rounded-lg border border-border mt-6 mx-auto px-6 sm:px-12 lg:px-16 py-8 w-full sm:w-4/5 md:w-3/5 lg:w-2/5 justify-center">
                <p className="text-white text-center text-xl font-bold">Statystyki</p>
               <div className="flex flex-col justify-between items-center mt-5 w-full">
                    <div className="flex justify-between mt-3 w-full">
                        <p className="text-white">Wygrane:</p>
                        <p className="text-white">{wins}</p>
                    </div>
                    <div className="flex justify-between mt-3 w-full">
                        <p className="text-white">Największa ilość punktów:</p>
                        <p className="text-white">{highestScore}</p>
                    </div>
               </div>
            </div>
        </div>
    )
}