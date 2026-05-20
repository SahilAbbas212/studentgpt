import {
    usePomodoro
} from "../context/PomodoroContext";

function FloatingPomodoro() {

    const {
        timeLeft,
        mode
    } = usePomodoro();

    const mins =
        Math.floor(timeLeft / 60);

    const secs =
        timeLeft % 60;

    return (

        <div className="
            fixed
            bottom-6
            right-6
            z-50
            glass
            px-6
            py-4
            rounded-3xl
            border
            border-cyan-500/20
        ">

            <div className="
                text-cyan-400
                font-black
                text-xl
            ">

                {
                    mode === "Study"
                    ? "📚"
                    : "☕"
                }

                {" "}

                {
                    String(mins)
                    .padStart(2, "0")
                }

                :

                {
                    String(secs)
                    .padStart(2, "0")
                }

            </div>

        </div>
    );
}

export default FloatingPomodoro;