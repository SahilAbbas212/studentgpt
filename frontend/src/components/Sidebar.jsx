import {

    FaHome,
    FaStickyNote,
    FaBook,
    FaLayerGroup,
    FaRobot,
    FaChartPie,
    FaCalendarAlt,
    FaCog,
    FaClock,
    FaSignOutAlt

} from "react-icons/fa";

import {
    Link,
    useLocation
} from "react-router-dom";

import {
    motion
} from "framer-motion";

function Sidebar() {

    const location =
        useLocation();

    // ✅ USER

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    const userName =
    user?.name || "Student";

    const firstLetter =
    userName
    .charAt(0)
    .toUpperCase();

    // ✅ MENU

    const menu = [

        {
            name: "Dashboard",
            icon: <FaHome />,
            path: "/"
        },

        {
            name: "Notes",
            icon: <FaStickyNote />,
            path: "/notes"
        },

        {
            name: "Quiz",
            icon: <FaBook />,
            path: "/quiz"
        },

        {
            name: "Flashcards",
            icon: <FaLayerGroup />,
            path: "/flashcards"
        },

        {
            name: "Chatbot",
            icon: <FaRobot />,
            path: "/chatbot"
        },

        {
            name: "Analytics",
            icon: <FaChartPie />,
            path: "/analytics"
        },

        {
            name: "Timetable",
            icon: <FaCalendarAlt />,
            path: "/timetable"
        },

        {
            name: "Pomodoro",
            icon: <FaClock />,
            path: "/pomodoro"
        },

        {
            name: "Settings",
            icon: <FaCog />,
            path: "/settings"
        }

    ];

    return (

        <div className="
            relative
            h-screen
            w-[380px]
            glass
            border-r
            border-white/10
            px-8
            py-10
            flex
            flex-col
            justify-between
            sticky
            top-0
            shadow-[0_0_80px_rgba(34,211,238,0.08)]
            backdrop-blur-3xl
        ">

            {/* BACKGROUND GLOWS */}

            <div className="
                absolute
                top-0
                left-0
                w-96
                h-96
                bg-cyan-500/10
                blur-[160px]
                rounded-full
            " />

            <div className="
                absolute
                bottom-0
                right-0
                w-96
                h-96
                bg-purple-500/10
                blur-[180px]
                rounded-full
            " />

            {/* MAIN CONTENT */}

            <div className="
                relative
                z-10
            ">

                {/* LOGO */}

                <div className="
                    mb-16
                ">

                    <motion.h1

                        whileHover={{
                            scale: 1.02
                        }}

                        className="
                            text-[3.2rem]
                            leading-none
                            tracking-[-2px]
                            font-black
                            whitespace-nowrap
                            bg-gradient-to-r
                            from-cyan-400
                            via-blue-400
                            to-purple-500
                            text-transparent
                            bg-clip-text
                            drop-shadow-lg
                        "
                    >

                        StudentGPT

                    </motion.h1>

                    <p className="
                        text-slate-500
                        dark:text-slate-400
                        mt-3
                        text-sm
                        tracking-wide
                    ">

                        AI Academic Productivity OS

                    </p>

                </div>

                {/* MENU */}

                <div className="
                    flex
                    flex-col
                    gap-5
                ">

                    {
                        menu.map(
                            (
                                item,
                                index
                            ) => (

                                <motion.div

                                    whileHover={{
                                        scale: 1.04,
                                        x: 6
                                    }}

                                    key={index}
                                >

                                    <Link

                                        to={item.path}

                                        className={`
                                            relative
                                            overflow-hidden
                                            flex
                                            items-center
                                            gap-5
                                            px-7
                                            py-5
                                            rounded-[1.7rem]
                                            transition-all
                                            duration-500
                                            font-bold
                                            text-xl

                                            ${
                                                location.pathname === item.path

                                                ?

                                                "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.35)]"

                                                :

                                                "text-slate-600 dark:text-slate-400 hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                                            }
                                        `}
                                    >

                                        {/* ACTIVE LINE */}

                                        {
                                            location.pathname === item.path && (

                                                <div className="
                                                    absolute
                                                    left-0
                                                    top-4
                                                    bottom-4
                                                    w-1.5
                                                    rounded-full
                                                    bg-white
                                                " />
                                            )
                                        }

                                        {/* ACTIVE GLOW */}

                                        {
                                            location.pathname === item.path && (

                                                <div className="
                                                    absolute
                                                    inset-0
                                                    bg-white/10
                                                    backdrop-blur-xl
                                                " />
                                            )
                                        }

                                        {/* ICON */}

                                        <div className="
                                            relative
                                            z-10
                                            text-3xl
                                            drop-shadow-lg
                                        ">

                                            {item.icon}

                                        </div>

                                        {/* NAME */}

                                        <div className="
                                            relative
                                            z-10
                                        ">

                                            {item.name}

                                        </div>

                                    </Link>

                                </motion.div>
                            )
                        )
                    }

                </div>

            </div>

            {/* USER CARD */}

            <motion.div

                whileHover={{
                    scale: 1.03,
                    y: -3
                }}

                className="
                    relative
                    overflow-hidden
                    glass
                    rounded-[2.3rem]
                    p-6
                    border
                    border-cyan-500/20
                    shadow-[0_0_50px_rgba(34,211,238,0.12)]
                "
            >

                {/* CARD GLOW */}

                <div className="
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-cyan-500/10
                    via-blue-500/5
                    to-purple-500/10
                " />

                {/* CONTENT */}

                <div className="
                    relative
                    z-10
                ">

                    {/* USER INFO */}

                    <div className="
                        flex
                        items-center
                        gap-5
                        mb-6
                    ">

                        {/* AVATAR */}

                        <motion.div

                            whileHover={{
                                rotate: 8,
                                scale: 1.08
                            }}

                            className="
                                w-20
                                h-20
                                rounded-[1.7rem]
                                bg-gradient-to-br
                                from-cyan-500
                                via-blue-500
                                to-purple-500
                                flex
                                items-center
                                justify-center
                                text-white
                                text-3xl
                                font-black
                                shadow-[0_0_30px_rgba(59,130,246,0.35)]
                            "
                        >

                            {firstLetter}

                        </motion.div>

                        {/* TEXT */}

                        <div>

                            <h2 className="
                                text-slate-900
                                dark:text-white
                                text-2xl
                                font-black
                                leading-tight
                            ">

                                {userName}

                            </h2>

                            <p className="
                                text-slate-500
                                dark:text-slate-400
                                text-sm
                                mt-2
                                tracking-wide
                            ">

                                ✨ Premium AI User

                            </p>

                        </div>

                    </div>

                    {/* LOGOUT BUTTON */}

                    <button

                        onClick={() => {

                            localStorage.clear();

                            window.location.href =
                            "/login";
                        }}

                        className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-3
                            px-6
                            py-5
                            rounded-[1.7rem]
                            bg-gradient-to-r
                            from-red-500
                            via-pink-500
                            to-orange-500
                            text-white
                            font-black
                            text-xl
                            hover:scale-[1.03]
                            hover:shadow-[0_0_40px_rgba(239,68,68,0.35)]
                            transition-all
                            duration-500
                        "
                    >

                        <FaSignOutAlt />

                        Logout

                    </button>

                </div>

            </motion.div>

        </div>

    );
}

export default Sidebar;