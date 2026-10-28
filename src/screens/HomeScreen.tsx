import { useState } from 'react';
import { CircleCheck, Plus, Minus, UserRoundPen, UserRound, UsersRound } from 'lucide-react';
import { useGameStore, type GameMode } from '../store/gameStore';
import { useProfileStore } from '../store/profileStore';
import { useNavigate, Link } from "react-router-dom";
import type { Question } from '../constants/types';
import { getQuestionsForGame } from '../services/supa';


function HomeScreen() {
  const [openModal, setOpenModal] = useState(false);
  const [gameMode, setGameMode] = useState<string>("");
  const [botsCount, setBotsCount] = useState<number>(10);

  const modalHandler = () => {
    setOpenModal(!openModal);
    setGameMode("")
  }
  const setGameModeHandler = (mode: string) => {
    if (gameMode !== mode) {
      setGameMode(mode);
    } else {
      setGameMode("");
    }
  }
  const startGame = useGameStore(state => state.startGame);
  const username = useProfileStore(state => state.username);
  const avatarUrl = useProfileStore(state => state.avatarUrl);

  const navigate = useNavigate();

  const gameStartHandler = async () => {
    const questions: Question[] = await getQuestionsForGame();
    startGame(gameMode as GameMode, questions, username, botsCount, avatarUrl);
    setOpenModal(false);
    navigate("/game", {replace: true});
  }
  return (
    <div className='px-8 min-h-screen flex flex-col'>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          {/* modal box */}
          <div className="w-full max-w-sm rounded-2xl border border-border bg-backgroundLight p-5">

            <h2 className="mb-2 text-xl font-bold text-white">
              Wybierz tryb gry
            </h2>

            <div className="p-2">
              <div className="flex justify-between gap-4 items-center">
                <button
                  onClick={() => setGameModeHandler("classic")}
                  className={`flex-1 border border-borderHover hover:bg-border px-3 py-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
                    gameMode === "classic" ? "bg-borderHover" : ""
                  }`}
                >
                  <span className="text-white">Klasyczny</span>
                  {gameMode === "classic" && <CircleCheck color="white" size={16} />}
                </button>

                <button
                  onClick={() => setGameModeHandler("final")}
                  className={`flex-1 border border-borderHover hover:bg-border px-3 py-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
                    gameMode === "final" ? "bg-borderHover" : ""
                  }`}
                >
                  <span className="text-white">Finał</span>
                  {gameMode === "final" && <CircleCheck color="white" size={16} />}
                </button>

                <button
                  onClick={() => setGameModeHandler("solo")}
                  className={`flex-1 border border-borderHover hover:bg-border px-3 py-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer ${
                    gameMode === "solo" ? "bg-borderHover" : ""
                  }`}
                >
                  <span className="text-white">Solo</span>
                  {gameMode === "solo" && <CircleCheck color="white" size={16} />}
                </button>
              </div>

              {gameMode === "classic" && (
                <div className="mt-5 flex flex-col gap-2">
                  <p className="text-center text-white">
                    Ilość przeciwników
                  </p>

            <div className="flex items-center justify-center gap-2">
              <button
                disabled={botsCount === 15}
                onClick={() => setBotsCount(botsCount + 1)}
                className="rounded-full bg-borderHover p-1 disabled:bg-gray-600 cursor-pointer hover:bg-border"
              >
                <Plus color="white" size={20} />
              </button>

              <div className="rounded-lg border border-border px-4 py-1">
                <span className="font-semibold text-white">
                  {botsCount}
                </span>
              </div>

              <button
                disabled={botsCount === 3}
                onClick={() => setBotsCount(botsCount - 1)}
                className="rounded-full bg-borderHover p-1 disabled:bg-gray-600 cursor-pointer hover:bg-border"
              >
                <Minus color="white" size={20} />
              </button>
            </div>
              </div>
              )}
            </div>

            <button
              onClick={gameStartHandler}
              disabled={!gameMode}
              className={`mt-5 w-full rounded-xl p-3 ${
                !gameMode ? "bg-gray-600" : "bg-green-600"
              } ${!gameMode ? "cursor-not-allowed" : "cursor-pointer hover:bg-green-700"}`}
            >
              <span className="font-semibold text-white">
                Rozpocznij grę!
              </span>
            </button>

            <button
              onClick={modalHandler}
              className="mt-5 w-full rounded-xl bg-red-600 p-3 cursor-pointer hover:bg-red-700"
            >
              <span className="font-semibold text-white">
                Powrót do menu
              </span>
            </button>
          </div>
        </div>
      )}

      <div className='flex flex-col gap-2 justify-center items-center my-auto pt-18'>
        <div className='mb-10'>
          <p className='text-4xl sm:text-5xl lg:text-7xl font-bold text-white text-center'>Super <span className='text-sky-800'>Quiz</span></p>
          <p className='mt-2 text-sky-800 text-center text-sm sm:text-base lg:text-lg tracking-[0.25em] uppercase'>Trening do Teleturnieju</p>
        </div>
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center'>
          <button onClick={modalHandler} className='bg-background border-3 border-border px-12 py-3 sm:px-16 sm:py-6 rounded-xl flex flex-col justify-center items-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105'>
            <UserRound color='white' size={42} />
            <p className='text-center text-nowrap text-white font-bold text-lg sm:text-xl'>Gra jednoosobowa</p>
          </button>
          <Link to="/game-room">
            <button className='bg-background border-3 border-border px-12 py-3 sm:px-16 sm:py-6 rounded-xl flex flex-col justify-center items-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105'>
              <UsersRound color='white' size={42} />
              <p className='text-center text-nowrap text-white font-bold text-lg sm:text-xl'>Gra wieloosobowa</p>
            </button>
          </Link>
          <Link to="/profile">
            <button className='bg-background border-3 border-border px-26 py-3 sm:px-14 sm:py-5.5 rounded-xl flex flex-col justify-center items-center gap-2 transition-all duration-300 cursor-pointer hover:scale-105'>
              <UserRoundPen color='white' size={40} />
              <p className='text-center text-nowrap text-white font-bold text-lg sm:text-2xl'>Profil</p>
            </button>
          </Link>
        </div>
      </div>
      <p className="mt-auto py-8 text-blue-200 text-center text-sm sm:text-base lg:text-lg tracking-[0.25em] uppercase opacity-70">Created by Sentharion</p>
    </div>
  )
}

export default HomeScreen
