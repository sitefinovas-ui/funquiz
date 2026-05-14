export default function Loader({
  title = "Chargement...",
  subtitle = "Préparation de votre contenu",
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
        
          {/* Spinner pro */}
          <div className="relative mb-6 h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500" />
              <img src="/Log.png" alt="logo funquiz" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-white" />
          </div>

     

      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-140%);
          }
          100% {
            transform: translateX(320%);
          }
        }
      `}</style>
    </div>
  );
}