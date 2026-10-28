import {Bot,UserRoundPlus,Check,X,UserX} from "lucide-react";
import { useGameStore, type Player } from "../store/gameStore";
import { useEffect,useState } from "react";
import type { PlayerColor } from "../constants/types";
import { useNavigate } from "react-router-dom";
import { generateBotName, randomColor } from "../constants/types";
import { getQuestionsForGame, getEasyQuestionsForGame } from "../services/supa";
import type { Question } from "../constants/types";
import { useProfileStore } from "../store/profileStore";
import { colorClasses } from "../constants/types";
import { SlUserFemale,SlUser } from "react-icons/sl";


const GameRoomScreen = () => {
    const [openModal, setOpenModal] = useState(false);
    const [colorActive,setColorActive] = useState<PlayerColor | null>(null);
    const [gender,setGender] = useState<'male' | 'female'| null>(null);
    const [playerName, setPlayerName] = useState("");
    const [playerCount,setPlayerCount] = useState(0);
    const [deleteOpen,setDeleteOpen] = useState(false);
    const navigate = useNavigate();
    const startGame = useGameStore(state => state.startGame);
    const players = useGameStore((state) => state.players);
    const username = useProfileStore(state => state.username);
    const avatarUrl = useProfileStore(state => state.avatarUrl);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'hard'>('easy');

    useEffect(() => {
        const store = useGameStore.getState();
        store.resetGame();
        store.addPlayer({
            id: 1,
            username: username,
            avatarColor: randomColor(),
            avatar: avatarUrl || undefined,
            points: 0,
            isBot: false,
            sex: 'male',
            active: true,
            lives: 3
        });
    }, [username, avatarUrl]);

    const getSex = () => {
        if(players.filter(p => p.sex === 'male').length > players.filter(p => p.sex === 'female').length) return 'female';
        return 'male';
    }

    const addPlayer = (name: string, color: PlayerColor, avatarUrl: string | undefined, points: number, isBot: boolean, active: boolean, lives: number, sex:'male' | 'female') => {
        const player: Player = {
            id: useGameStore.getState().players.length + 1,
            username:name,
            avatarColor: color,
            avatar: avatarUrl ?? undefined,
            points:points,
            isBot:isBot,
            sex:sex,
            active:active,
            lives:lives
        };
        useGameStore.getState().addPlayer(player);
        if(playerCount <= 25){
            setPlayerCount(playerCount + 1);
        }
        setOpenModal(false);
        setColorActive(null);
        setPlayerName("");
        setDeleteOpen(false);
    }
    const addRandomBot = () => {
        const player: Player = {
            id: useGameStore.getState().players.length + 1,
            username:generateBotName(1)[0],
            avatarColor: randomColor(),
            points:0,
            sex:getSex(),
            isBot:true,
            active:true,
            lives:3,
            knowledge:Math.floor(Math.random() * 31) + 60
        };
        useGameStore.getState().addPlayer(player);
        if(playerCount <= 25){
            setPlayerCount(playerCount + 1);
        }
        setDeleteOpen(false);
    }
    const removePlayer = (id: number) => {
        useGameStore.getState().removePlayer(id);
        setPlayerCount(playerCount - 1);
    }

    const gameStartHandler = async () => {
        let questions: Question[] = [];
        if(selectedDifficulty === "easy"){
            questions = await getEasyQuestionsForGame();
        }else{
            questions = await getQuestionsForGame();
        }
        startGame('multiplayer', questions, username, players.length, avatarUrl);
        setOpenModal(false);
        navigate("/game", {replace: true});
    }


    return (
        <div className="flex items-center justify-center min-h-screen py-8 px-2">
            {openModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                <div className="w-full max-w-sm rounded-2xl border border-borderHover bg-background p-5">
                    <h2 className="mb-3 text-x text-center font-bold text-white">
                        Dodaj gracza
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <input type="text" placeholder="Nazwa gracza" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full rounded-xl border border-border bg-backgroundLight p-2 text-white" />
                        <div className="flex flex-col gap-2 w-full">
                            <p className="text-white">Wybierz płeć gracza</p>
                            <div className="flex gap-2 items-center justify-center flex-wrap">
                                <button onClick={() => setGender('male')} className={`w-10 h-10 rounded-full flex items-center justify-center border border-border ${gender === 'male' ? 'bg-blue-500' : 'bg-backgroundLight'} hover:cursor-pointer hover:scale-110 transition-all duration-200`}>
                                    <SlUser size={19} color="white"/>
                                </button>
                                <button onClick={() => setGender('female')} className={`w-10 h-10 rounded-full flex items-center justify-center border border-border ${gender === 'female' ? 'bg-pink-500' : 'bg-backgroundLight'} hover:cursor-pointer hover:scale-110 transition-all duration-200`}>
                                    <SlUserFemale size={19} color="white"/>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-white">Wybierz kolor gracza</p>
                            <div className="flex gap-2 items-center justify-center flex-wrap">
                            {(Object.keys(colorClasses) as PlayerColor[]).map((color) => (
                                <div key={color} onClick={() => setColorActive(color === colorActive ? null : color as PlayerColor)} className={`w-8 h-8 rounded-full flex items-center justify-center border border-border ${colorClasses[color]} hover:cursor-pointer hover:scale-110 transition-all duration-200`}>
                                    {color === colorActive && (
                                        <Check size={20} color="white"/>                           
                                    )}
                                </div>
                            ))}
                            </div>
                        </div>
                        <div className="flex gap-4 w-full">
                            <button onClick = {() => addPlayer(playerName.trim() || "Gracz",colorActive || "red","",0,false,true,3,gender ?? 'male')} className="flex-1 p-2 rounded-xl bg-primary border-2 border-primary hover:bg-primary/80 cursor-pointer text-white font-semibold transition-colors duration-200">Dodaj</button>
                            <button onClick={() => { setOpenModal(false); setColorActive(null); setPlayerName(""); }} className="flex-1 p-2 rounded-xl bg-red-500 border-2 border-red-600 hover:bg-red-600 cursor-pointer transition-colors duration-200 text-white font-semibold">Anuluj</button>
                        </div>
                    </div>
                </div>
            </div>
            )}
            <div className="bg-background border-border rounded-2xl border-2 w-full max-w-7xl">
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 pt-5 px-6 border-b bg-backgroundLight border-border pb-5 rounded-t-2xl">
                    <div className="ml-3 whitespace-nowrap">
                        <p className="text-muted text-center text-2xl font-semibold mr-12">Konfiguracja sesji</p>
                        <p className="text-white text-center text-4xl font-bold">Tworzenie gry</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4  whitespace-nowrap">
                        <label className="flex items-center gap-2 text-white font-semibold">
                            Wybierz poziom trudności:
                            <select className="bg-backgroundLight border border-border rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-primary" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'hard')}>
                                <option value="easy">Łatwy</option>
                                <option value="hard">Trudny</option>
                            </select>
                        </label>
                        <button onClick={() => setOpenModal(true)} disabled={players.length >= 25} className={`py-3 px-8 rounded-xl flex gap-2 bg-primary border-2 border-primary hover:bg-primary/80 transition-colors duration-200 cursor-pointer text-white font-semibold ${players.length >= 25 && "opacity-50 cursor-not-allowed"}`}>
                            <UserRoundPlus size={24} color="white"/>
                            <p>Dodaj gracza</p>
                        </button>
                        <button onClick={() => addRandomBot()} disabled={players.length >= 25} className={`py-3 px-8 rounded-xl bg-orange-500 border-2 border-orange-600 hover:bg-orange-600 transition-colors duration-200 cursor-pointer text-white font-semibold flex gap-2 ${players.length >= 25 && "opacity-50 cursor-not-allowed"}`}>
                            <Bot size={24} color="white"/>
                            <p>Dodaj bota</p>
                        </button>
                        <button onClick={() => setDeleteOpen(!deleteOpen)} disabled={players.length <= 1} className={`py-3 px-8 rounded-xl bg-red-500 border-2 border-red-600 text-white font-semibold flex gap-2 transition-colors duration-200 ${players.length <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600 cursor-pointer"}`}>
                            <UserX size={24} color="white"/>
                            <p>Usuń gracza</p>
                        </button>
                    </div>
                </div>
                <div className="mt-10 pt-10 pb-10">
                    <p className="text-white text-center text-2xl font-semibold mb-1">Gracze ({players.length}/25)</p>
                    <div className="flex justify-center items-center gap-2 mb-10">
                        <p className="text-muted">Aby rozpocząć grę potrzeba przynajmniej 4 graczy</p>
                        {players.length >= 4 ? (
                            <Check size={20} color="green"/>
                        ) : (
                            <X size={20} color="red"/>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-4 mt-5">
                        {players.map((player) => (
                            <div key={player.id} className="flex flex-col items-center gap-2">
                                <div className={`flex items-center justify-center w-20 h-20 rounded-full ${!player.isBot && player.avatarColor ? colorClasses[player.avatarColor as PlayerColor] : "bg-gray-500"}`}>
                                    {player.isBot ? (
                                        <Bot size={40} color="white"/>
                                    ) : player.avatar ? (
                                        <img src={player.avatar} alt="" className="w-20 h-20 rounded-full"/>
                                    ) : (
                                        player.sex === 'male' ? (
                                            <SlUser size={40} color="white"/>
                                        ) : (
                                            <SlUserFemale size={40} color="white"/>
                                        )
                                    )}
                                    
                                </div>
                                <p className="text-white">{player.username}</p>
                                {deleteOpen && player.id !== 1 && (
                                    <button onClick={() => removePlayer(player.id)} className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors duration-200">
                                        <X size={20} color="white"/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center bg-backgroundLight border-t border-border justify-center gap-4 mt-8 py-6 rounded-b-2xl">
                    <button onClick={gameStartHandler} className= "py-3 px-8 rounded-xl bg-green-500 border-2 border-green-600 hover:bg-green-600 cursor-pointer transition-colors duration-200 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:border-gray-600" disabled={players.length < 4}>Rozpocznij grę</button>
                    <button onClick={() => navigate("/", {replace: true})} className="py-3 px-8 rounded-xl bg-red-500 border-2 border-red-600 hover:bg-red-600 cursor-pointer transition-colors duration-200 text-white font-semibold">Powrót do menu</button>
                </div>
            </div>
        </div>
    );
}

export default GameRoomScreen;

/*{players && (
                    <div className="flex gap-8 items-center justify-center">
                    {players.map((player) => (
                        <div key={player.id} className="flex flex-col items-center gap-2">
                            <div className={`flex items-center bg-${player.color}-400 p-2 rounded-full border border-border`}>
                                <UserRound size={24} color="white"/>
                            </div>
                            <p className="text-white">{player.name}</p>
                        </div>
                    ))}
                </div>
                )}
                */                