import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { playSound } from "../services/sounds";

const TIME_LIMIT = 15;

const Answers = () => {
    const { questions, currentQuestionIndex, answerQuestion, currentPlayerId, awaitingDesignation, players, isPaused } = useGameStore();
    const [selectedState, setSelectedState] = useState<{ answer: string, questionIndex: number } | null>(null);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [barProgress, setBarProgress] = useState(1); // 1 = full, 0 = empty
    const [allAnswers, setAllAnswers] = useState<string[]>([]);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const answerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animFrameRef = useRef<number | null>(null);
    
    // Zmienne do precyzyjnego obsługiwania pauzy w animacji i czasie
    const startTimeRef = useRef<number | null>(null);
    const pausedAtRef = useRef<number | null>(null);
    const totalPausedTimeRef = useRef<number>(0);
    const answerSubmittedRef = useRef<boolean>(false);

    const question = questions ? questions[currentQuestionIndex] : undefined;
    const selectedAnswer = selectedState?.questionIndex === currentQuestionIndex ? selectedState.answer : null;
    const currentPlayer = players.find(p => p.id === currentPlayerId);
    const isCurrentPlayerHuman = !!currentPlayer && !currentPlayer.isBot;

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || !isCurrentPlayerHuman || answerSubmittedRef.current || isPaused) return;
        answerSubmittedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        stopBarAnimation();
        setSelectedState({ answer, questionIndex: currentQuestionIndex });

        const isCorrect = answer === question?.correct_answer;
        if (isCorrect) {
            playSound('correct');
        } else {
            playSound('wrong');
        }

        answerTimeoutRef.current = setTimeout(() => {
            answerQuestion(isCorrect, currentPlayerId ?? undefined, currentQuestionIndex);
        }, 1500);
    };

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            if (!question || !question.correct_answer) {
                setAllAnswers([]);
                return;
            }

            const answers = [
                question.correct_answer,
                ...(question.distractors || [])
            ];

            setAllAnswers(
                [...answers].sort(() => Math.random() - 0.5)
            );
        });

        return () => cancelAnimationFrame(raf);
    }, [question]);

    const startBarAnimation = (durationMs: number) => {
        if (startTimeRef.current === null) {
            startTimeRef.current = performance.now();
            totalPausedTimeRef.current = 0;
        }

        const tick = (now: number) => {
            if (useGameStore.getState().isPaused) {
                return; // Czekamy w miejscu, nie aktualizujemy postępu
            }

            // Jeśli gra właśnie została wznowiona, dodajemy czas trwania pauzy do łącznego czasu pauz
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

    const stopBarAnimation = () => {
        if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    };

    // Reakcja na zmianę stanu pauzy
    useEffect(() => {
        if (isPaused) {
            pausedAtRef.current = performance.now();
            stopBarAnimation();
        } else {
            if (pausedAtRef.current !== null && !answerSubmittedRef.current && isCurrentPlayerHuman && !awaitingDesignation && question) {
                startBarAnimation(TIME_LIMIT * 1000);
            }
        }
    }, [isPaused]);

    // Główny efekt inicjalizujący timer i rundę pytania
    useEffect(() => {
        answerSubmittedRef.current = false;
        stopBarAnimation();
        startTimeRef.current = null;
        pausedAtRef.current = null;
        totalPausedTimeRef.current = 0;

        const raf = requestAnimationFrame(() => {
            setTimeLeft(TIME_LIMIT);
            setBarProgress(1);
        });

        if (!isCurrentPlayerHuman || awaitingDesignation || !question) {
            return () => cancelAnimationFrame(raf);
        }

        startBarAnimation(TIME_LIMIT * 1000);

        let currentLeft = TIME_LIMIT;
        timerRef.current = setInterval(() => {
            if (useGameStore.getState().isPaused) {
                return; // Nie zmniejszaj czasu podczas pauzy
            }

            currentLeft -= 1;
            setTimeLeft(currentLeft);
            if (currentLeft <= 0) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                handleAnswer("__timeout__");
            }
        }, 1000);

        return () => {
            cancelAnimationFrame(raf);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            if (answerTimeoutRef.current) {
                clearTimeout(answerTimeoutRef.current);
            }

            stopBarAnimation();
        };
    }, [currentQuestionIndex, currentPlayerId, awaitingDesignation]);

    // Obsługa logiki bota z uwzględnieniem pauzy
    useEffect(() => {
        if (isCurrentPlayerHuman || awaitingDesignation || !question) return;

        const currentBot = players.find(p => p.id === currentPlayerId);
        if (!currentBot || !currentBot.isBot || !currentBot.active) return;

        // Jeśli gra jest spauzowana, nie uruchamiamy timera bota
        if (isPaused) return;

        const timer = setTimeout(() => {
            if (answerSubmittedRef.current || useGameStore.getState().isPaused) return;
            const isCorrect = Math.random() * 100 < (currentBot.knowledge || 50);
            let chosenAnswer = "";
            if (isCorrect) {
                chosenAnswer = question.correct_answer;
            } else {
                const wrongAnswers = question.distractors || [];
                if (wrongAnswers.length > 0) {
                    chosenAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
                } else {
                    chosenAnswer = allAnswers.find(a => a !== question.correct_answer) || question.correct_answer;
                }
            }

            const finalIsCorrect = chosenAnswer === question.correct_answer;
            if (finalIsCorrect) {
                playSound('correct');
            } else {
                playSound('wrong');
            }

            answerSubmittedRef.current = true;
            if (timerRef.current) clearInterval(timerRef.current);
            stopBarAnimation();
            setSelectedState({ answer: chosenAnswer, questionIndex: currentQuestionIndex });

            answerTimeoutRef.current = setTimeout(() => {
                answerQuestion(finalIsCorrect, currentPlayerId as number, currentQuestionIndex);
            }, 1500);

        }, 3000);

        return () => clearTimeout(timer);
    }, [currentQuestionIndex, currentPlayerId, awaitingDesignation, question, players, allAnswers, isPaused]);

    const isTimedOut = timeLeft === 0;

    // Kolor paska w zależności od postępu
    const barColor =
        barProgress > 0.4 ? '#22c55e' :
        barProgress > 0.15 ? '#f59e0b' :
        '#ef4444';

    if (!question) return null;

    return (
        <div className="w-full p-2 bg-background border-t border-border flex flex-col relative">
            {awaitingDesignation && (
                <div className="absolute inset-0 flex justify-center items-center z-10">
                    <p className="text-white font-bold text-3xl text-center mx-auto">
                        {isCurrentPlayerHuman ? "Wybierz kto odpowiada!" : "Czekaj na wybór gracza..."}
                    </p>
                </div>
            )}

            {/* Pytanie */}
            <div className={`px-4 mt-2 min-h-[110px] w-full flex justify-center items-center mb-5 ${awaitingDesignation ? 'opacity-0 pointer-events-none' : ''}`}>
                <div className="text-center">
                    <p className="text-muted text-center text-xl">{question.category}</p>
                    <p className="text-white text-center text-xl font-bold">{question.question}</p>
                </div>
            </div>

            {/* Odpowiedzi */}
            <div className={`flex flex-wrap justify-between w-full max-w-4xl px-4 mx-auto duration-200 mt-2 ${awaitingDesignation ? "opacity-0 pointer-events-none" : (!isCurrentPlayerHuman || isPaused ? "opacity-50" : "")}`}>
                {allAnswers.map((answer, index) => {
                    let bgColor = "bg-backgroundLight";
                    let borderColor = "border-border";
                    if (selectedAnswer || isTimedOut) {
                        if (answer === question.correct_answer) { bgColor = "bg-green-600"; borderColor = "border-green-500"; }
                        else if (answer === selectedAnswer) { bgColor = "bg-red-600"; borderColor = "border-red-500"; }
                    }
                    return (
                        <div key={index} className="w-full sm:w-[49%] mb-5">
                            <button
                                disabled={!!selectedAnswer || isTimedOut || !isCurrentPlayerHuman || isPaused}
                                onClick={() => handleAnswer(answer)}
                                className={`h-22.5 w-full ${bgColor} rounded-xl border ${borderColor} px-2 py-3 flex justify-center items-center ${isCurrentPlayerHuman && !awaitingDesignation && !isPaused ? "hover:scale-105 transition-all duration-200" : ""} cursor-pointer disabled:cursor-default`}
                            >
                                <p className="text-white text-center text-sm md:text-base line-clamp-3">{answer}</p>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Timer bar */}
            <div className="w-full px-2 py-4 h-10">
                {isCurrentPlayerHuman && !awaitingDesignation && (
                    <div className="w-1/2 mx-auto h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            style={{
                                height: "100%",
                                backgroundColor: barColor,
                                width: `${barProgress * 100}%`,
                                transition: "background-color 0.5s ease",
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Answers;