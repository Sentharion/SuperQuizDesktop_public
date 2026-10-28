import Stand from "../components/Stand";
import Answers from "../components/Answers";
import { useGameStore } from "../store/gameStore";
import { useEffect, useRef, useState } from "react";
import { SlUser, SlUserFemale } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import { colorClasses } from "../constants/types"
import { Pause, Play } from "lucide-react";

const GameScreen = () => {
    const {
        players, mode, stage, currentPlayerId, awaitingDesignation,
        buzzEnabled, buzzLocked, buzzIn, designatePlayer, questionsRemaining, getAlivePlayers,
        gameFinished, resetGame, isTransitioning, finishTransition, skipQuestion, currentQuestionIndex, isPaused, pauseGame, unpauseGame
    } = useGameStore();

    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Transition animation state
    const [transitionVisible, setTransitionVisible] = useState(false);

    const BUZZ_TIMER = mode === "multiplayer" ? 15 : 5;
    const [timeLeft, setTimeLeft] = useState(BUZZ_TIMER);
    const [barProgress, setBarProgress] = useState(1);
    
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const animFrameRef = useRef<number | null>(null);

    // Zmienne do precyzyjnego obsługiwania pauzy w timerze finałowym
    const startTimeRef = useRef<number | null>(null);
    const pausedAtRef = useRef<number | null>(null);
    const totalPausedTimeRef = useRef<number>(0);

    const stopBarAnimation = () => {
        if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    };

    // Transition fade-in effect
    useEffect(() => {
        if (!isTransitioning) return;

        const raf1 = requestAnimationFrame(() => {
            setTransitionVisible(false);

            const raf2 = requestAnimationFrame(() => {
                setTransitionVisible(true);
            });

            return () => cancelAnimationFrame(raf2);
        });

        return () => cancelAnimationFrame(raf1);
    }, [isTransitioning]);

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    const isPlayerTurn = !!currentPlayer && !currentPlayer.isBot;

    // Automatyczne scrollowanie do aktualnego gracza
    useEffect(() => {
        if (currentPlayerId && scrollRef.current) {
            const index = players.findIndex(p => p.id === currentPlayerId);
            if (index !== -1) {
                const children = scrollRef.current.children;
                if (children[index]) {
                    setTimeout(() => {
                        children[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                    }, 100);
                }
            }
        }
    }, [currentPlayerId, players]);

    // Logika botów - wyznaczanie gracza
    useEffect(() => {
        if (!currentPlayerId || isPaused) return;

        const currentBot = players.find(p => p.id === currentPlayerId);
        if (!currentBot || !currentBot.isBot || !currentBot.active) return;

        if (awaitingDesignation) {
            const timer = setTimeout(() => {
                if (useGameStore.getState().isPaused) return;
                let alive = getAlivePlayers();
                if (stage !== 3) {
                    alive = alive.filter(p => p.id !== currentPlayerId);
                }
                if (alive.length > 0) {
                    const target = alive[Math.floor(Math.random() * alive.length)];
                    designatePlayer(target.id);
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayerId, awaitingDesignation, players, designatePlayer, getAlivePlayers, stage, isPaused]);

    // Reakcja na zmianę stanu pauzy dla timera finałowego
    useEffect(() => {
        if (isPaused) {
            pausedAtRef.current = performance.now();
            stopBarAnimation();
        } else {
            if (pausedAtRef.current !== null) {
                const isWaitingForBuzz =
                    stage === 3 &&
                    buzzEnabled &&
                    !buzzLocked &&
                    !awaitingDesignation &&
                    !isTransitioning &&
                    !gameFinished &&
                    !currentPlayerId;

                if (isWaitingForBuzz) {
                    // Wznawiamy animację paska
                    const startLocalBarAnimation = (durationMs: number) => {
                        const tick = (now: number) => {
                            if (useGameStore.getState().isPaused) {
                                return;
                            }
                            if (pausedAtRef.current !== null) {
                                totalPausedTimeRef.current += now - pausedAtRef.current;
                                pausedAtRef.current = null;
                            }

                            const activeElapsed = now - (startTimeRef.current ?? now) - totalPausedTimeRef.current;
                            const progress = Math.max(0, 1 - activeElapsed / durationMs);
                            setBarProgress(progress);

                            if (progress > 0) {
                                animFrameRef.current = requestAnimationFrame(tick);
                            } else {
                                animFrameRef.current = null;
                            }
                        };
                        animFrameRef.current = requestAnimationFrame(tick);
                    };
                    startLocalBarAnimation(BUZZ_TIMER * 1000);
                }
            }
        }
    }, [isPaused]);

    // Timer na zgłoszenie się w finale (5 sekund) z obsługą pauzy
    useEffect(() => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        stopBarAnimation();
        startTimeRef.current = null;
        pausedAtRef.current = null;
        totalPausedTimeRef.current = 0;

        const isWaitingForBuzz =
            stage === 3 &&
            buzzEnabled &&
            !buzzLocked &&
            !awaitingDesignation &&
            !isTransitioning &&
            !gameFinished &&
            !currentPlayerId;

        let intervalId: ReturnType<typeof setInterval> | null = null;

        const startLocalBarAnimation = (durationMs: number) => {
            startTimeRef.current = performance.now();
            totalPausedTimeRef.current = 0;

            const tick = (now: number) => {
                if (useGameStore.getState().isPaused) {
                    return;
                }
                if (pausedAtRef.current !== null) {
                    totalPausedTimeRef.current += now - pausedAtRef.current;
                    pausedAtRef.current = null;
                }

                const activeElapsed = now - (startTimeRef.current ?? now) - totalPausedTimeRef.current;
                const progress = Math.max(0, 1 - activeElapsed / durationMs);
                setBarProgress(progress);

                if (progress > 0) {
                    animFrameRef.current = requestAnimationFrame(tick);
                } else {
                    animFrameRef.current = null;
                }
            };
            animFrameRef.current = requestAnimationFrame(tick);
        };

        const raf = requestAnimationFrame(() => {
            setTimeLeft(BUZZ_TIMER);
            setBarProgress(1);
        });

        if (!isWaitingForBuzz) {
            return () => cancelAnimationFrame(raf);
        }

        startLocalBarAnimation(BUZZ_TIMER * 1000);

        let currentLeft = BUZZ_TIMER;
        intervalId = setInterval(() => {
            if (useGameStore.getState().isPaused) {
                return; // Nie zmniejszaj czasu podczas pauzy
            }

            currentLeft -= 1;
            setTimeLeft(currentLeft);
            if (currentLeft <= 0) {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                skipQuestion();
            }
        }, 1000);
        timerIntervalRef.current = intervalId;

        return () => {
            cancelAnimationFrame(raf);
            if (intervalId) clearInterval(intervalId);
            stopBarAnimation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        stage,
        buzzEnabled,
        buzzLocked,
        awaitingDesignation,
        isTransitioning,
        gameFinished,
        currentPlayerId,
        currentQuestionIndex
    ]);

    const player1 = players.find(p => p.id === 1);
    const etap = stage === 1 ? "Runda pierwsza" : stage === 2 ? "Runda druga" : "Finał";

    if (isTransitioning) {
        return (
            <div className="flex flex-1 bg-background justify-center items-center px-8 gap-6 min-h-screen">
                <div
                    style={{
                        opacity: transitionVisible ? 1 : 0,
                        transform: transitionVisible ? "scale(1)" : "scale(0.8)",
                        transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2rem",
                    }}
                >
                    <p className="text-white text-5xl font-bold text-center mb-8">
                        {etap}
                    </p>
                    <button
                        onClick={() => finishTransition()}
                        className="bg-primary px-10 py-5 rounded-2xl shadow-lg border border-primary/50 cursor-pointer hover:brightness-110 transition-all"
                    >
                        <p className="text-white font-bold text-xl uppercase tracking-widest">Rozpocznij</p>
                    </button>
                </div>
            </div>
        );
    }

    // Ekran końca gry
    if (gameFinished) {
        return (
            <div className="flex flex-col flex-1 bg-background justify-center items-center px-8 gap-6 min-h-screen">
                <p className="text-white text-4xl font-bold text-center">Koniec gry!</p>
                {mode === "multiplayer" ? getAlivePlayers().sort((a, b) => b.points - a.points).map((player, index) => (
                    <div key={player.id} className="flex flex-row items-center gap-2">
                        <p className="text-white text-lg">{index + 1}.</p>
                        <div className={`w-16 h-16 rounded-full flex justify-center items-center overflow-hidden ${player.avatarColor ? colorClasses[player.avatarColor] : "red"}`} >
                            {player.avatar ? <img src={player.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : player.sex === "male" ? <SlUser color="white" size={30} /> : <SlUserFemale color="white" size={30} />}
                        </div>
                        <p className="text-white font-bold">{player.username}: {player.points} {player.points === 1 ? "punkt" : "punkty"}</p>
                    </div>
                )) :
                    <>{player1 && (
                        <p className="text-gray-300 text-xl text-center">
                            Twoje punkty: {player1.points}
                        </p>
                    )}</>}
                <button
                    onClick={() => {
                        resetGame();
                        navigate("/", { replace: true });
                    }}
                    className="bg-primary px-8 py-4 rounded-xl mt-5 cursor-pointer hover:brightness-110 transition-all"
                >
                    <p className="text-white font-bold text-lg">Wróć do menu</p>
                </button>
            </div>
        );
    }

    // Czy czekamy na zgłoszenia (nikt nie buzzował jeszcze)
    const isWaitingForBuzz = stage === 3 && buzzEnabled && !buzzLocked && !awaitingDesignation && !currentPlayerId;

    return (
        <div className="flex flex-col flex-1 min-h-screen">
            {/* Header / StatusBar */}
            <div className="flex flex-wrap justify-between px-4 py-2 items-center bg-background border-b border-border">
                {isPaused ? (
                        <p className="text-white text-lg font-bold text-center">Pauza</p>
                ) : (
                <div className="flex flex-row items-center gap-2">
                    <p className="text-white text-lg font-bold">{mode === "solo" ? "Tryb Solo" : etap}</p>
                    {stage === 3 && (
                        <div className="bg-borderHover rounded-2xl p-2 text-center">
                            <p className="text-white font-bold">Pytania: {questionsRemaining}</p>
                        </div>
                    )}
                </div>
               )}
               <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (isPaused) {
                                unpauseGame();
                            } else {
                                pauseGame();
                            }
                        }}
                        className="bg-amber-400/80 border-2 border-amber-400 px-3 py-2 rounded-xl"
                    >
                        {isPaused ? (
                            <Play
                                color="white"
                                size={20}
                            />
                        ) : (
                            <Pause
                                color="white"
                                size={20}
                            />
                        )}
                </button>
                <button onClick={() => { resetGame(); navigate("/", { replace: true }); }} className="bg-red-600/80 border-2 border-red-600 px-3 py-2 rounded-xl cursor-pointer hover:brightness-110 transition-all">
                    <p className="text-white font-bold">Wyjdź</p>
                </button>
               </div>
            </div>

            {/* Główny obszar graczy - poziomy scroll */}
            <div className="flex flex-1 overflow-x-auto custom-scrollbar items-center w-full min-h-[300px]">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-4 px-6 py-8 mx-auto w-max"
                >
                    {players.map((p, index) => (
                        <Stand
                            key={p.id}
                            id={p.id}
                            username={p.username}
                            points={p.points}
                            lives={p.lives}
                            position={index + 1}
                            gameMode={mode}
                            active={p.active}
                            avatar={p.avatar}
                            avatarColor={p.avatarColor}
                            isBot={p.isBot}
                            sex={p.sex ?? 'male'}
                            isCurrent={currentPlayerId === p.id}
                            canBeDesignated={awaitingDesignation && isPlayerTurn && p.active && (stage !== 3 ? p.id !== currentPlayerId : true)}
                            onDesignate={designatePlayer}
                        />
                    ))}
                </div>
            </div>

            {/* Przycisk zgłaszania się dla gracza */}
            {buzzEnabled && players.filter(p => !p.isBot && p.active).length > 0 && (
                <div className="px-4 pb-2 flex justify-center gap-4 flex-wrap">
                    {players.filter(p => !p.isBot && p.active).map(p => (
                        <button
                            key={p.id}
                            disabled={isPaused}
                            onClick={() => !isPaused && buzzIn(p.id)}
                            className={`bg-orange-500 px-6 py-4 rounded-xl flex items-center justify-center shadow-lg transition-all ${isPaused ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110 hover:scale-110 active:scale-95"}`}
                        >
                            <p className="text-white text-xl font-bold uppercase tracking-wider">{p.username}: Zgłoś się!</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Pasek timera - widoczny tylko gdy czekamy na zgłoszenia */}
            {isWaitingForBuzz && (
                <div className="px-4 pb-2">
                    <div className="flex flex-row items-center gap-3">
                        <p className="text-white font-bold text-lg w-6 text-center">{timeLeft}</p>
                        <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                style={{
                                    height: "100%",
                                    backgroundColor: "#f97316",
                                    width: `${barProgress * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Pytania i odpowiedzi */}
            <div className="">
                <Answers />
            </div>
        </div>
    );
};

export default GameScreen;