import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Info, CheckCircle2, ChevronRight, ChevronLeft, Hand } from 'lucide-react';
import { useStore, DzikirType } from '../store/useStore';
import { dzikirData } from '../data/dzikir';
import { clsx } from 'clsx';

export function DzikirDetail() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  const { currentSession, startSession, incrementProgress, nextDzikir, prevDzikir, completeSession } = useStore();

  useEffect(() => {
    if (type === 'pagi' || type === 'petang') {
      startSession(type as DzikirType);
    }
  }, [type, startSession]);

  const filteredDzikir = dzikirData.filter(d => d.type === 'both' || d.type === type);
  const currentItem = filteredDzikir[currentSession.currentIndex];
  
  if (!currentItem) {
    return null;
  }

  const currentProgress = currentSession.progress[currentItem.id] || 0;
  const isTargetReached = currentProgress >= currentItem.target;

  const handleTap = () => {
    if (!isTargetReached) {
      incrementProgress(currentItem.id, currentItem.target);
      if (currentProgress + 1 >= currentItem.target) {
        setShowModal(true);
      }
    }
  };

  const handleNext = () => {
    setShowModal(false);
    if (currentSession.currentIndex < filteredDzikir.length - 1) {
      nextDzikir();
    } else {
      completeSession();
      navigate('/history');
    }
  };

  const handlePrev = () => {
    setShowModal(false);
    if (currentSession.currentIndex > 0) {
      prevDzikir();
    }
  };

  return (
    <div className="relative flex flex-col h-screen max-w-md mx-auto overflow-hidden bg-[#F5FBF7]">
      <div className="flex items-center px-4 py-3 bg-[#F5FBF7] sticky top-0 z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex w-12 h-12 items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#171D1A]" />
        </button>
        <h2 className="text-[#171D1A] text-[22px] font-normal leading-7 flex-1 text-center truncate px-2">
          Dzikir {type === 'pagi' ? 'Pagi' : 'Petang'}
        </h2>
        <button className="flex w-12 h-12 items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors">
          <Info className="w-6 h-6 text-[#404944]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-48 pt-2 space-y-6">
        <div className="bg-[#DBE5DE]/30 rounded-2xl p-6 space-y-6">
          <h3 className="font-arabic text-[#171D1A] text-3xl leading-[2.5rem] text-center font-bold" dir="rtl">
            {currentItem.arabic}
          </h3>
          <div className="space-y-4">
            <p className="text-[#006C4C] font-medium text-center text-base italic leading-relaxed">
              {currentItem.transliteration}
            </p>
            <p className="text-[#404944] text-sm leading-6 text-center tracking-wide">
              {currentItem.translation}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#CFE9D9] text-[#0A1F16]">
            <span className="text-sm font-medium mr-2">Target:</span>
            <span className="text-lg font-bold">{currentProgress}</span>
            <span className="text-sm mx-1">/</span>
            <span className="text-lg font-bold">{currentItem.target}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5FBF7] via-[#F5FBF7] to-transparent pt-12">
        <div className="flex justify-center mb-6">
          <button 
            onClick={handleTap}
            disabled={isTargetReached}
            className={clsx(
              "w-24 h-24 rounded-2xl shadow-md hover:shadow-sm active:shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group",
              isTargetReached ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#89F8C6] text-[#002114]"
            )}
          >
            <Hand className="w-10 h-10 group-active:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-wide">TAP</span>
          </button>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handlePrev}
            disabled={currentSession.currentIndex === 0}
            className={clsx(
              "flex-1 h-12 rounded-full flex items-center justify-center gap-2 transition-colors",
              currentSession.currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#E8F5EE] text-[#0A1F16] hover:bg-[#E8F5EE]/80 active:bg-[#E8F5EE]/70"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">Sebelumnya</span>
          </button>

          <button 
            onClick={handleNext}
            className="flex-1 h-12 rounded-full flex items-center justify-center gap-2 transition-colors bg-[#CFE9D9] text-[#0A1F16] hover:bg-[#CFE9D9]/80 active:bg-[#CFE9D9]/70"
          >
            <span className="text-sm font-medium tracking-wide">
              {currentSession.currentIndex < filteredDzikir.length - 1 ? 'Berikutnya' : 'Selesai'}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200">
          <div className="relative w-full max-w-[312px] bg-[#F5FBF7] rounded-[28px] shadow-lg overflow-hidden flex flex-col">
            <div className="flex flex-col items-center pt-6 px-6">
              <CheckCircle2 className="w-8 h-8 text-[#4D6357] mb-4" />
              <h4 className="text-[#171D1A] text-2xl font-normal text-center mb-4">Target Tercapai!</h4>
            </div>
            <div className="px-6 pb-6">
              <p className="text-[#404944] text-base leading-6 text-center">
                Alhamdulillah, Anda telah menyelesaikan bacaan ini. Lanjut ke bacaan berikutnya?
              </p>
            </div>
            <div className="flex flex-col gap-2 p-6 pt-0">
              <button 
                onClick={handleNext}
                className="w-full h-10 px-6 rounded-full bg-[#006C4C] text-white text-sm font-medium tracking-wide hover:shadow-md active:shadow-none transition-shadow flex items-center justify-center"
              >
                Lanjut Sekarang
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full h-10 px-6 rounded-full text-[#006C4C] text-sm font-medium tracking-wide hover:bg-[#006C4C]/10 active:bg-[#006C4C]/10 transition-colors flex items-center justify-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
