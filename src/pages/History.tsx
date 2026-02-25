import { Calendar, Search, Check, X, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { clsx } from 'clsx';

export function History() {
  const { history } = useStore();

  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = history.find(h => h.date === dateStr);
    
    return {
      date,
      dateStr,
      entry: entry || { date: dateStr, pagiCompleted: false, petangCompleted: false }
    };
  });

  const completedCount = last7Days.filter(d => d.entry.pagiCompleted && d.entry.petangCompleted).length;
  const percentage = Math.round((completedCount / 7) * 100);

  return (
    <div className="flex-1 overflow-y-auto pb-[88px] px-4 space-y-6">
      <div className="flex items-center justify-between h-16">
        <h1 className="text-3xl text-[#191C1A] font-normal">Riwayat Saya</h1>
        <div className="flex gap-2">
          <button className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer">
            <Calendar className="w-6 h-6 text-[#191C1A]" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer">
            <Search className="w-6 h-6 text-[#191C1A]" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar scroll-pl-4">
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#89F8C7] text-[#002114] px-4 border border-transparent hover:shadow-sm transition-all">
          <Check className="w-[18px] h-[18px]" strokeWidth={3} />
          <span className="text-sm font-medium tracking-wide">Minggu Ini</span>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-[#707973] text-[#404943] px-4 bg-transparent hover:bg-black/5 transition-colors">
          <span className="text-sm font-medium tracking-wide">Bulan Ini</span>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-[#707973] text-[#404943] px-4 bg-transparent hover:bg-black/5 transition-colors">
          <Calendar className="w-[18px] h-[18px]" />
          <span className="text-sm font-medium tracking-wide">Pilih Tanggal</span>
        </button>
      </div>

      <div className="bg-[#F0F5F1] rounded-[20px] p-4 flex flex-col gap-1">
        <h3 className="text-lg font-medium text-[#191C1A]">7 Hari Terakhir</h3>
        <p className="text-base text-[#404943]">Anda telah menyelesaikan {percentage}% target minggu ini.</p>
      </div>

      <div className="flex flex-col">
        {last7Days.map(({ date, entry }, index) => {
          const isCompleted = entry.pagiCompleted && entry.petangCompleted;
          const isPartial = entry.pagiCompleted || entry.petangCompleted;
          const isMissed = !entry.pagiCompleted && !entry.petangCompleted;
          
          let statusText = '';
          let statusColor = '';
          let bgColor = '';
          let iconColor = '';
          let Icon = Check;
          let percentageText = '0%';

          if (isCompleted) {
            statusText = 'Completed: Pagi & Petang';
            statusColor = 'text-[#2E7D32]';
            bgColor = 'bg-[#B9F6CA]';
            iconColor = 'text-[#2E7D32]';
            Icon = Check;
            percentageText = '100%';
          } else if (isPartial) {
            statusText = `Partial: Hanya ${entry.pagiCompleted ? 'Pagi' : 'Petang'}`;
            statusColor = 'text-[#ED6C02]';
            bgColor = 'bg-[#FFE0B2]';
            iconColor = 'text-[#ED6C02]';
            Icon = Clock;
            percentageText = '50%';
          } else {
            statusText = 'Missed: Tidak ada catatan';
            statusColor = 'text-[#B00020]';
            bgColor = 'bg-[#F9DEDC]';
            iconColor = 'text-[#B00020]';
            Icon = X;
            percentageText = '0%';
          }

          return (
            <div key={index} className="flex items-center min-h-[72px] py-2 border-b border-[#BFC9C2]/30 last:border-0 hover:bg-black/5 active:bg-black/10 rounded-xl px-2 -mx-2 transition-colors">
              <div className={clsx("flex w-10 h-10 shrink-0 items-center justify-center rounded-full mr-4", bgColor, iconColor)}>
                <Icon className="w-5 h-5" strokeWidth={isCompleted ? 3 : 2} />
              </div>
              <div className="flex flex-col flex-1 gap-0.5">
                <p className="text-base text-[#191C1A] font-normal">
                  {format(date, 'EEEE, dd MMM', { locale: id })}
                </p>
                <p className="text-sm text-[#404943]">{statusText}</p>
              </div>
              <span className={clsx("text-sm font-medium px-2 py-0.5 rounded-md", statusColor, bgColor.replace('bg-', 'bg-').replace(']', ']/50'))}>
                {percentageText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
