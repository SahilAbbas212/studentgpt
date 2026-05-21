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
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";

import {
    Link,
    useLocation
} from "react-router-dom";

import {
    motion
} from "framer-motion";

function Sidebar({ closeSidebar }) {

    const location = useLocation();

    // ✅ USER

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const userName =
        user?.name || "Student";

    const firstLetter =
        userName.charAt(0).toUpperCase();

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

        <div
            className="
                relative
                h-screen
                w-[290px]
                md:w-[340px]
                glass
                border-r
                border-white/10
                px-4
                md:px-8
                py-6
                md:py-10
                flex
                flex-col
                justify-between
                sticky
                top-0
                shadow-[0_0_80px_rgba(34,211,238,0.08)]
                backdrop-blur-3xl
                overflow-y-auto
            "
        >

            {/* MOBILE CLOSE BUTTON */}

            <button
                onClick={closeSidebar}
                className="
                    md:hidden
                    absolute
                    top-5
                    right-5
                    text-white
                    text-2xl
                    z-50
                "
            >
                <FaTimes />
            </button>

            {/* BACKGROUND GLOWS */}

            <div className="
                absolute
                top-0
                left-0
                w-72
                h-72
                bg-cyan-500/10
                blur-[120px]
                rounded-full
            " />

            <div className="
                absolute
                bottom-0
                right-0
                w-72
                h-72
                bg-purple-500/10
                blur-[140px]
                rounded-full
            " />

            {/* MAIN CONTENT */}

            <div className="relative z-10">

                {/* LOGO */}

                <div className="mb-10 md:mb-16">

                    <motion.h1

                        whileHover={{
                            scale: 1.02
                        }}

                        className="
                            text-4xl
                            md:text-[3.2rem]
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
                        text-xs
                        md:text-sm
                        tracking-wide
                    ">

                        AI Academic Productivity OS

                    </p>

                </div>

                {/* MENU */}

                <div className="
                    flex
                    flex-col
                    gap-3
                    md:gap-5
                ">

                    {
                        menu.map((item, index) => (

                            <motion.div

                                whileHover={{
                                    scale: 1.02,
                                    x: 4
                                }}

                                key={index}
                            >

                                <Link

                                    to={item.path}

                                    onClick={() =>
                                        closeSidebar?.()
                                    }

                                    className={`
                                        relative
                                        overflow-hidden
                                        flex
                                        items-center
                                        gap-4
                                        px-5
                                        md:px-7
                                        py-4
                                        md:py-5
                                        rounded-2xl
                                        md:rounded-[1.7rem]
                                        transition-all
                                        duration-500
                                        font-bold
                                        text-base
                                        md:text-xl

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
                                                top-3
                                                bottom-3
                                                w-1.5
                                                rounded-full
                                                bg-white
                                            " />
                                        )
                                    }

                                    {/* ICON */}

                                    <div className="
                                        relative
                                        z-10
                                        text-xl
                                        md:text-2xl
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
                        ))
                    }

                </div>

            </div>

            {/* USER CARD */}

            <motion.div

                whileHover={{
                    scale: 1.02,
                    y: -2
                }}

                className="
                    relative
                    overflow-hidden
                    glass
                    rounded-[2rem]
                    p-4
                    md:p-6
                    border
                    border-cyan-500/20
                    shadow-[0_0_50px_rgba(34,211,238,0.12)]
                    mt-8
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

                <div className="relative z-10">

                    {/* USER INFO */}

                    <div className="
                        flex
                        items-center
                        gap-4
                        mb-5
                    ">

                        {/* AVATAR */}

                        <motion.div

                            whileHover={{
                                rotate: 8,
                                scale: 1.05
                            }}

                            className="
                                w-14
                                h-14
                                md:w-20
                                md:h-20
                                rounded-2xl
                                bg-gradient-to-br
                                from-cyan-500
                                via-blue-500
                                to-purple-500
                                flex
                                items-center
                                justify-center
                                text-white
                                text-xl
                                md:text-3xl
                                font-black
                            "
                        >

                            {firstLetter}

                        </motion.div>

                        {/* TEXT */}

                        <div>

                            <h2 className="
                                text-slate-900
                                dark:text-white
                                text-lg
                                md:text-2xl
                                font-black
                                leading-tight
                            ">

                                {userName}

                            </h2>

                            <p className="
                                text-slate-500
                                dark:text-slate-400
                                text-xs
                                md:text-sm
                                mt-1
                            ">

                                ✨ Premium AI User

                            </p>

                        </div>

                    </div>

                    {/* LOGOUT BUTTON */}

                    <button

                        onClick={() => {

                            localStorage.clear();

                            window.location.href = "/login";
                        }}

                        className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-3
                            px-4
                            py-4
                            rounded-2xl
                            bg-gradient-to-r
                            from-red-500
                            via-pink-500
                            to-orange-500
                            text-white
                            font-bold
                            md:font-black
                            text-sm
                            md:text-lg
                            hover:scale-[1.02]
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