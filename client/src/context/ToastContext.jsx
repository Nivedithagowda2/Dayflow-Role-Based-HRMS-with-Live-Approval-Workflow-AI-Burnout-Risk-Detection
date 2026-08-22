import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

const styles = {
  success: { bg: "bg-teal-500 text-bg-900", icon: CheckCircle2 },
  error: { bg: "bg-coral-500 text-bg-900", icon: XCircle },
  info: { bg: "bg-gold-400 text-bg-900", icon: Info },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => {
          const s = styles[t.type];
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              className={`${s.bg} rounded-xl shadow-lg shadow-black/30 px-4 py-3 flex items-center gap-2 animate-slideInRight font-medium`}
            >
              <Icon size={18} className="shrink-0" />
              <p className="text-sm font-medium">{t.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
