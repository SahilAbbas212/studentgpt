import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const PomodoroContext =
createContext();

export const PomodoroProvider =
({ children }) => {

    const [studyMinutes,
    setStudyMinutes] =
    useState(25);

    const [breakMinutes,
    setBreakMinutes] =
    useState(5);

    const [timeLeft,
    setTimeLeft] =
    useState(25 * 60);

    const [isRunning,
    setIsRunning] =
    useState(false);

    const [mode,
    setMode] =
    useState("Study");

    const [task,
    setTask] =
    useState("");

    const [sessions,
    setSessions] =
    useState(0);

    const [endTime,
    setEndTime] =
    useState(null);

    // ✅ START TIMER

    const startTimer = () => {

        const end =
            Date.now() +
            timeLeft * 1000;

        setEndTime(end);

        localStorage.setItem(
            "pomodoroEndTime",
            end
        );

        setIsRunning(true);
    };

    // ✅ PAUSE TIMER

    const pauseTimer = () => {

        setIsRunning(false);

        localStorage.removeItem(
            "pomodoroEndTime"
        );
    };

    // ✅ RESET TIMER

    const resetTimer = () => {

        setIsRunning(false);

        localStorage.removeItem(
            "pomodoroEndTime"
        );

        setMode("Study");

        setTimeLeft(
            studyMinutes * 60
        );
    };

    // ✅ GLOBAL TIMER

    useEffect(() => {

        const interval =
            setInterval(() => {

                const savedEndTime =
                    localStorage.getItem(
                        "pomodoroEndTime"
                    );

                if (
                    savedEndTime &&
                    isRunning
                ) {

                    const remaining =
                        Math.floor(
                            (
                                savedEndTime -
                                Date.now()
                            ) / 1000
                        );

                    if (
                        remaining <= 0
                    ) {

                        // ✅ BELL

                        const audio =
                            new Audio(
                                "/bell.mp3"
                            );

                        audio.play();

                        if (
                            mode === "Study"
                        ) {

                            setSessions(
                                prev => prev + 1
                            );

                            setMode("Break");

                            setTimeLeft(
                                breakMinutes * 60
                            );

                        } else {

                            setMode("Study");

                            setTimeLeft(
                                studyMinutes * 60
                            );
                        }

                        localStorage.removeItem(
                            "pomodoroEndTime"
                        );

                        setIsRunning(false);

                    } else {

                        setTimeLeft(
                            remaining
                        );
                    }
                }

            }, 1000);

        return () =>
            clearInterval(interval);

    }, [
        isRunning,
        mode,
        studyMinutes,
        breakMinutes
    ]);

    return (

        <PomodoroContext.Provider
            value={{

                studyMinutes,
                setStudyMinutes,

                breakMinutes,
                setBreakMinutes,

                timeLeft,
                setTimeLeft,

                isRunning,
                setIsRunning,

                mode,
                setMode,

                task,
                setTask,

                sessions,

                startTimer,
                pauseTimer,
                resetTimer

            }}
        >

            {children}

        </PomodoroContext.Provider>
    );
};

export const usePomodoro =
() => useContext(PomodoroContext);