import { useMemo, useState } from 'react';
import { BarChartOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import QuizStats from './QuizStats';
import './quiz.css';
import QuizList from './QuizList';
import QuizCreate from './QuizCreate';

const Quiz = () => {
  const [selectedMenu, setSelectedMenu] = useState('stats');

  const menuItems = useMemo(
    () => [
      {
        key: 'stats',
        icon: <BarChartOutlined />,
        label: 'Statistiques',
      },
      {
        key: 'list',
        icon: <FileTextOutlined />,
        label: 'Liste des quiz',
      },
      {
        key: 'create',
        icon: <PlusOutlined />,
        label: 'Créer un quiz',
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
      case 'create':
        return <QuizCreate />;
      default:
        return <QuizStats />;
    }
  }, [selectedMenu]);

  return (
    <section className="bo-quiz">
      <header className="bo-quiz-header">
        <div>
          <h1 className="bo-quiz-title">Quiz</h1>
          <p className="bo-quiz-subtitle">Statistiques, liste et création.</p>
        </div>
      </header>

      <nav className="bo-quiz-nav" role="tablist" aria-label="Navigation Quiz">
        {menuItems.map((item) => {
          const isActive = selectedMenu === item.key;
          return (
            <button
              key={item.key}
              id={`bo-quiz-tab-${item.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`bo-quiz-panel-${item.key}`}
              tabIndex={isActive ? 0 : -1}
              className={`bo-quiz-tab ${isActive ? 'is-active' : ''}`}
              onClick={() => setSelectedMenu(item.key)}
            >
              <span className="bo-quiz-tabIcon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="bo-quiz-tabLabel">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div
        className="bo-quiz-content"
        role="tabpanel"
        id={`bo-quiz-panel-${selectedMenu}`}
        aria-labelledby={`bo-quiz-tab-${selectedMenu}`}
      >
        {content}
      </div>
    </section>
  );
};

export default Quiz;
