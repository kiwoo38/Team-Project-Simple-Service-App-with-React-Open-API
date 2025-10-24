import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AutoBanner() {
    const navigate = useNavigate();
    const banners = [
        {
            id: 1,
            type: "custom", // ✅ 네 기존 배너
        },
        {
            id: 2,
            image:
                "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1600&q=80",
            title: "맛있는 인연을 만드는 순간",
            subtitle: "새로운 사람들과의 한 끼, 인생의 또 다른 추억이 됩니다.",
            quote: "“맛과 이야기가 함께하는 곳, Taste Link”",
            button: "지금 참여하기",
            bg: "bg-orange-50",
            text: "text-orange-600",
        },
        {
            id: 3,
            image:
                "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1600&q=80",
            title: "당신의 테이블에 행복을 담다",
            subtitle: "좋은 사람, 좋은 음식, 그리고 따뜻한 마음까지.",
            quote: "“Together, We Taste Better”",
            button: "모임 만들기",
            bg: "bg-yellow-50",
            text: "text-yellow-700",
        },
    ];

    const [current, setCurrent] = useState(0);

    // ✅ 자동 전환
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]); // ✅ 공식적으로 권장되는 방식


    // ✅ 수동 전환 함수
    const handlePrev = () => {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    };
    const handleNext = () => {
        setCurrent((prev) => (prev + 1) % banners.length);
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-8 overflow-hidden rounded-3xl shadow-lg h-[500px]">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {banner.type === "custom" ? (
                        // ✅ 기존 배너
                        <section className="w-full h-full bg-pink-50 flex flex-col md:flex-row items-center justify-between px-6 py-14 text-gray-800">
                            <img
                                src="https://cdn.pixabay.com/photo/2017/08/07/11/14/people-2602736_1280.jpg"
                                alt="함께 식사하는 사람들"
                                className="w-72 md:w-[400px] rounded-2xl object-cover shadow-md mb-8 md:mb-0"
                            />
                            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 md:gap-4 md:pl-10">
                                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                    당신의 한 끼가 추억이 되는 순간
                                </h2>
                                <p className="text-lg md:text-xl font-light opacity-90">
                                    Taste Link에서 함께 만들어가요.
                                </p>
                                <p className="text-base md:text-lg italic text-gray-600 mt-2">
                                    “좋은 사람 × 맛있는 음식 × 행복한 시간”
                                </p>
                                <p className="text-sm md:text-base mt-1 text-gray-500">
                                    지금 바로 모임을 신청해보세요!
                                </p>
                                <button
                                    onClick={() => navigate("/create")}
                                    className="mt-5 bg-white text-pink-500 font-semibold px-6 py-3 rounded-xl shadow hover:bg-pink-50 transition"
                                >
                                    모집글 등록하기
                                </button>
                            </div>
                        </section>
                    ) : (
                        // ✅ 새 슬라이드
                        <section
                            className={`w-full h-full ${banner.bg} flex flex-col md:flex-row items-center justify-between px-6 py-14 text-gray-800`}
                        >
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-72 md:w-[400px] rounded-2xl object-cover shadow-md mb-8 md:mb-0"
                            />
                            <div
                                className={`flex flex-col items-center md:items-start text-center md:text-left gap-3 md:gap-4 md:pl-10 ${banner.text}`}
                            >
                                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                    {banner.title}
                                </h2>
                                <p className="text-lg md:text-xl font-light opacity-90">
                                    {banner.subtitle}
                                </p>
                                <p className="text-base md:text-lg italic mt-2">{banner.quote}</p>
                                <button onClick={() => navigate("/create")} className="mt-5 bg-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-gray-100 transition">
                                    {banner.button}
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            ))}

            {/* ✅ 수동 전환 버튼 */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                    onClick={handlePrev}
                    className="bg-white/80 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition"
                >
                    ◀
                </button>
                <button
                    onClick={handleNext}
                    className="bg-white/80 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition"
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
