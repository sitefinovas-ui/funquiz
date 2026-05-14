import { useMemo, useState } from 'react';
import { FaChartBar, FaList, FaPlus, FaCloudUploadAlt, FaLayerGroup, FaQuestionCircle } from 'react-icons/fa';
import QuizStats from './QuizStats';
import QuizList from './QuizList';
import QuizCreate from './QuizCreate';
import QuestionImport from './QuestionImport';
import QuestionManagement from './QuestionManagement';
import ThematicImport from './ThematicImport';
import ThematicManagement from './ThematicManagement';

const Quiz = () => {
  const [selectedMenu, setSelectedMenu] = useState('stats');

  const menuItems = useMemo(
    () => [
      {
        key: 'stats',
        icon: <FaChartBar />,
        label: 'Statistiques',
      },
      {
        key: 'list',
        icon: <FaList />,
        label: 'Liste des quiz',
      },
      {
        key: 'questions',
        icon: <FaQuestionCircle />,
        label: 'Gestion Questions',
      },
      {
        key: 'thematics',
        icon: <FaLayerGroup />,
        label: 'Gestion Thématiques',
      },
      {
        key: 'create',
        icon: <FaPlus />,
        label: 'Créer un quiz',
      },
      {
        key: 'import',
        icon: <FaCloudUploadAlt />,
        label: 'Importation Quiz',
      },
      {
        key: 'import-thematic',
        icon: <FaCloudUploadAlt />,
        label: 'Importation Thématiques',
      },
    ],
    []
  );

  const content = useMemo(() => {
    switch (selectedMenu) {
      case 'stats':
        return <QuizStats />;
      case 'list':
        return <QuizList />;
      case 'questions':
        return <QuestionManagement />;
      case 'thematics':
        return <ThematicManagement />;
      case 'create':
        return <QuizCreate />;
      case 'import':
        return <QuestionImport />;
      case 'import-thematic':
        return <ThematicImport />;
      default:
        return <QuizStats />;
    }
  }, [selectedMenu]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quiz</h1>
        <p className="text-slate-500 font-medium">Gérez vos contenus pédagogiques et ludiques</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-[24px] w-fit">
        {menuItems.map((item) => {
          const isActive = selectedMenu === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setSelectedMenu(item.key)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-[18px] text-sm font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {content}
      </div>
    </div>
  );
};

export default Quiz;

