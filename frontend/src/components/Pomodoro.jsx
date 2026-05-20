import {
    useState,
    useEffect
} from "react";

function Pomodoro() {

    const [seconds, setSeconds] =
        useState(1500);
const [customMinutes, setCustomMinutes] =
useState(25);
    const [running, setRunning] =
        useState(false);

    const [mode, setMode] =
        useState("Study");

    useEffect(() => {

        let timer;

        if (
            running &&
            seconds > 0
        ) {

            timer = setInterval(() => {

                setSeconds(
                    (prev) => prev - 1
                );

            }, 1000);
        }

        if (seconds === 0) {

            if (mode === "Study") {

                setMode("Break");

                setSeconds(300);

            } else {

                setMode("Study");

                setSeconds(1500);
            }
        }

        return () =>
            clearInterval(timer);

    }, [running, seconds, mode]);

    const formatTime =
    () => {

        const mins =
            Math.floor(seconds / 60);

        const secs =
            seconds % 60;

        return `
            ${String(mins).padStart(2, "0")}
            :
            ${String(secs).padStart(2, "0")}
        `;
    };

    return (

        <div className="
            glass
            p-10
            rounded-3xl
            text-center
            max-w-xl
            mx-auto
        ">

            <h1 className="
                text-5xl
                font-extrabold
                mb-8
                bg-gradient-to-r
                from-cyan-400
                to-purple-500
                text-transparent
                bg-clip-text
            ">
                Pomodoro Timer
            </h1>

            <div className="
                text-7xl
                font-extrabold
                text-yellow-300
                mb-8
            ">

                {formatTime()}

            </div>

            <div className="
                text-2xl
                text-cyan-400
                font-bold
                mb-10
            ">

                {mode} Mode

            </div>

            <div className="
                flex
                justify-center
                gap-6
            ">

                <button
                    onClick={() =>
                        setRunning(true)
                    }

                    className="
                        gradient-btn
                        px-8
                        py-4
                        rounded-2xl
                        text-xl
                        font-bold
                    "
                >
                    Start
                </button>

                <button
                    onClick={() =>
                        setRunning(false)
                    }

                    className="
                        gradient-btn
                        px-8
                        py-4
                        rounded-2xl
                        text-xl
                        font-bold
                    "
                >
                    Pause
                </button>

                <button
                    onClick={() => {

                        setRunning(false);

                        setSeconds(1500);

                        setMode("Study");
                    }}

                    className="
                        gradient-btn
                        px-8
                        py-4
                        rounded-2xl
                        text-xl
                        font-bold
                    "
                >
                    Reset
                </button>

            </div>

        </div>
    );
}

export default Pomodoro;