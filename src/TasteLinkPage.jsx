import { Search, Bell, BookmarkPlus, Info, Trash2, ChevronDown, User } from "lucide-react";

// Default export so the canvas can preview it
export default function TasteLinkPage() {
  const categories = [
    {
      title: "스시",
      people: "3/4",
      img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
      badge: false,
    },
    {
      title: "고기",
      people: "3/4",
      img: "https://images.unsplash.com/photo-1604908176997-431a1a5b9a5a?q=80&w=1400&auto=format&fit=crop",
      badge: false,
    },
    {
      title: "찌개",
      people: "2/8",
      img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1400&auto=format&fit=crop",
      badge: false,
    },
    {
      title: "스시",
      people: "3/8",
      img: "https://images.unsplash.com/photo-1607301405390-6f2da0b3a8af?q=80&w=1400&auto=format&fit=crop",
      badge: true,
    },
    {
      title: "스테이크",
      people: "1/5",
      img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1400&auto=format&fit=crop",
      badge: true,
    },
    {
      title: "회",
      people: "3/6",
      img: "https://images.unsplash.com/photo-1580554530778-ca36943938ce?q=80&w=1400&auto=format&fit=crop",
      badge: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Taste Link <span className="text-gray-500">“취향을 잇다”</span>
          </h1>

          <div className="ml-auto hidden md:flex items-center gap-2 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                className="w-full rounded-full border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="오늘은 뭐 먹지? 검색 필터(지역,식당이름)"
              />
            </div>
          </div>

          <nav className="ml-auto grid grid-cols-4 gap-6 text-center text-xs">
            <ToolbarIcon icon={BookmarkPlus} label="모집글 등록" />
            <ToolbarIcon icon={Bell} label="모집글 수정" />
            <ToolbarIcon icon={Info} label="상세 정보" />
            <ToolbarIcon icon={Trash2} label="모집글 삭제" />
          </nav>

          <button className="ml-4 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
            내 지역
            <ChevronDown className="h-4 w-4" />
          </button>

          <button className="ml-2 rounded-full border p-2"><User className="h-5 w-5"/></button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border">
          {/* Replace with your own hero image if desired */}
          <img
            src="https://images.unsplash.com/photo-1514517220031-f9f0d036f114?q=80&w=1600&auto=format&fit=crop"
            alt="식사하는 가족"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-[#ff824d] font-semibold">“당신의 한 끼가 추억이 되는 순간”</p>
          <p className="mt-1 text-[#ff824d]">Taste Link에서 함께 만들어가요.</p>
          <p className="mt-6 text-gray-600 leading-relaxed">
            “좋은 사람 × 좋은 음식 × 행복한 시간”
            <br />
            지금 바로 모임을 신청해보세요!
          </p>
          <button className="mt-8 rounded-md bg-rose-300 hover:bg-rose-400 transition-colors px-8 py-3 text-white font-medium">
            신청하기
          </button>
        </div>
      </section>

      {/* Category Grid */}
      <main className="mx-auto max-w-6xl px-4 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((c, i) => (
          <Card key={i} {...c} />
        ))}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4">
        <div className="border-t mt-16 pt-6 pb-16 text-sm text-gray-500 flex items-center justify-between">
          <span>Taste Link “취향을 잇다”</span>
          <div className="flex items-center gap-4 opacity-70">
            <span className="sr-only">socials</span>
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <div className="h-2 w-2 rounded-full bg-gray-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function ToolbarIcon({ icon: Icon, label }) {
  return (
    <div className="group">
      <div className="mx-auto h-10 w-10 grid place-items-center rounded-lg border hover:bg-gray-50 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-1 text-gray-700">{label}</div>
    </div>
  );
}

function Card({ title, people, img, badge }) {
  return (
    <article className="rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img src={img} alt={title} className="h-full w-full object-cover" />
        {badge && (
          <div className="absolute -right-2 -top-2 rotate-6">
            <div className="rounded-full bg-orange-200 px-3 py-1 text-[10px] font-bold text-orange-700 shadow">
              ✶✶ 2025
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">모집 인원 ({people})</p>
      </div>
    </article>
  );
}
