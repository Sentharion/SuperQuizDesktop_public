import { SlUserFemale,SlUser } from "react-icons/sl";
import { Bot } from "lucide-react";
import {useGameStore} from "../store/gameStore";

interface StandProps {
    id: number;
    username: string;
    points: number;
    lives: number;
    position: number;
    avatar?: string;
    avatarColor?: string;
    gameMode: string | null;
    active: boolean;
    sex: 'male' | 'female'
    isCurrent: boolean;
    canBeDesignated: boolean;
    isBot?: boolean;
    onDesignate: (id: number) => void;
}


const Stand = ({ id, username, points, lives, position, gameMode, avatar, avatarColor, active, isCurrent, canBeDesignated,sex,isBot, onDesignate }: StandProps) => {
    const stage = useGameStore((state) => state.stage);
    const pointsState =
    (gameMode === "classic" && stage === 3) ||
    gameMode === "final" ||
    gameMode === "solo" || (gameMode === "multiplayer" && stage === 3);

    return (
        <div className={`flex flex-col justify-center items-center gap-2 mt-10 ${!active ? "opacity-40" : ""}`}>
            <div
                className="w-20 h-20 rounded-full flex justify-center items-center overflow-hidden"
                style={{
                    backgroundColor: avatar ? "transparent" : avatarColor || '#0ea5e9',
                    border: isCurrent ? '6px solid #ebeb34' : ``,
                }}
            >
                {avatar ? <img src={avatar} style={{ width: isCurrent ? '70px' : '80px', height: isCurrent ? '70px' : '80px' }} /> : gameMode ==="classic" || gameMode==="final" ? sex === "male" ? <SlUser color="white" size={35} /> : <SlUserFemale color="white" size={35} /> : isBot ? <Bot color="white" size={35}/> : sex === "male" ? <SlUser color="white" size={35} /> : <SlUserFemale color="white" size={35} />}
            </div>
            <div className={`flex flex-col justify-center items-center rounded-2xl`}>
                <div className="flex flex-col justify-between items-center p-6 rounded-xl">
                    <div className="flex flex-col items-center bg-gray-400 rounded-xl gap-2 px-4 py-3 border-x-2 border-gray-500">
                        <div className="flex items-center gap-2">
                            <p className="text-lg text-yellow-400 font-semibold">{position}</p>
                            <div className={lives >= 3 ? "bg-green-500 w-7 h-5" : "bg-emerald-800 w-7 h-5"}></div>
                            <div className={lives >= 2 ? "bg-green-500 w-7 h-5" : "bg-emerald-800 w-7 h-5"}></div>
                            <div className={lives >= 1 ? "bg-green-500 w-7 h-5" : "bg-emerald-800 w-7 h-5"}></div>
                            <p className="text-lg text-yellow-400 font-semibold">{position}</p>
                        </div>
                        <div className="flex gap-2 items-center bg-yellow-400 p-2">
                            <p className="text-black font-bold text-center">{username}</p>
                            {pointsState && <p className="text-black font-bold">{points}</p>}
                        </div>
                    </div>
                    <div className="w-20 h-20 bg-gray-400 rounded-b-xl border-x-2 border-gray-500"></div>
                </div>
                {canBeDesignated && (
                    <button
                        className=" bg-green-600 cursor-pointer hover:bg-green-700 hover:scale-110 transition-all duration-150 px-4 py-2 rounded-xl"
                        onClick={() => onDesignate(id)}
                    >
                        <p className="text-white font-bold">Wybierz</p>
                    </button>
                )}
            </div>
        </div>
    )
}
export default Stand;