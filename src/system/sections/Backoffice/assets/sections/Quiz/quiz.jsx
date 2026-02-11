import React, { useState } from 'react';
import { Layout, Menu, Grid } from 'antd';
import { BarChartOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import QuizStats from './QuizStats';
import './quiz.css';
import QuizList from './QuizList';
import QuizCreate from './QuizCreate';

const { Content, Sider } = Layout;

const Quiz = () => {
  const [selectedMenu, setSelectedMenu] = useState('stats');
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const menuItems = [
    {
      key: 'stats',
      icon: <BarChartOutlined />,
      label: 'Statistiques',
    },
    {
      key: 'list',
      icon: <FileTextOutlined />,
      label: 'Liste des Quiz',
    },
    {
      key: 'create',
      icon: <PlusOutlined />,
      label: 'Créer un Quiz',
    },
  ];

  const renderContent = () => {
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
  };

  return (
    <Layout className={`quiz-layout ${isMobile ? 'is-mobile' : ''}`}>
      {isMobile ? (
        <div className="quiz-mobile-nav">
          <Menu
            mode="horizontal"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={({ key }) => setSelectedMenu(key)}
            className="quiz-menu quiz-menu-mobile"
          />
        </div>
      ) : (
        <Sider width={250} className="quiz-sider">
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={({ key }) => setSelectedMenu(key)}
            className="quiz-menu"
          />
        </Sider>
      )}
      <Content className="quiz-content">{renderContent()}</Content>
    </Layout>
  );
};

export default Quiz;
