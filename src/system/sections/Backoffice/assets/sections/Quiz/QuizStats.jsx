import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Alert, Table } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import quizStatsServices from '../../../../../configurations/Services/quizStatsServices.js';
import './QuizStats.css';

const QuizStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [thematicStats, setThematicStats] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [global, thematics, rank, activity] = await Promise.all([
        quizStatsServices.getGlobalStats(),
        quizStatsServices.getThematicStats(),
        quizStatsServices.getRankings(),
        quizStatsServices.getRecentActivity(),
      ]);

      // Mapping des statistiques globales en cohérence avec le backend
      const g = global?.data || {};
      setGlobalStats({
        totalUsers: g.total_participants ?? 0,
        completedQuizzes: g.total_quizzes ?? 0,
        averageSuccessRate: g.avg_success_rate ?? 0,
        // Utilise avg_score comme "Score moyen" (%)
        averageCompletionTime: g.avg_score ?? 0,
      });

      // Statistiques par thématique
      const thematicsData = (thematics?.data || []).map((t) => ({
        id: t.thematic_id,
        name: t.thematic_title,
        completedQuizzes: t.quiz_count,
        successRate: t.success_rate,
      }));
      setThematicStats(thematicsData);

      // Classement des utilisateurs
      const rankingsData = (rank?.data || []).map((r) => ({
        user_id: r.user_id,
        username: r.full_name || r.username,
        score: r.total_points ?? 0,
      }));
      setRankings(rankingsData);

      // Activité récente
      const activityData = (activity?.data || []).map((a) => ({
        history_id: a.history_id,
        date: a.played_at,
        username: a.full_name || a.username,
        quizName: `${a.quiz_title} · ${a.thematic_title}`,
        score: `${a.score}/${a.max_score}`,
      }));
      setRecentActivity(activityData);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" className="stats-loader" />;
  if (error) return <Alert message={error} type="error" />;

  const rankColumns = [
    {
      title: 'Rang',
      dataIndex: 'rank',
      key: 'rank',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
    },
  ];

  const activityColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Quiz',
      dataIndex: 'quizName',
      key: 'quizName',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
    },
  ];

  return (
    <div className="quiz-stats-container">
      <h1>Tableau de bord des Quiz</h1>

      {/* Statistiques globales */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card>
            <UserOutlined className="stats-icon" />
            <h3 className="fs-6">Utilisateurs totaux</h3>
            <p className="stats-number">{globalStats?.totalUsers || 0}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <TrophyOutlined className="stats-icon" />
            <h3 className="fs-6">Quiz complétés</h3>
            <p className="stats-number">{globalStats?.completedQuizzes || 0}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <CheckCircleOutlined className="stats-icon" />
            <h3 className="fs-6">Taux de réussite moyen</h3>
            <p className="stats-number">{globalStats?.averageSuccessRate || 0}%</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <ClockCircleOutlined className="stats-icon" />
            <h3 className="fs-6">Score moyen</h3>
            <p className="stats-number">{globalStats?.averageCompletionTime || 0}%</p>
          </Card>
        </Col>
      </Row>

      {/* Statistiques par thématique */}
      <Row gutter={16} className="stats-row">
        <Col span={12}>
          <Card title="Top du classement">
            <Table
              dataSource={rankings}
              columns={rankColumns}
              pagination={false}
              size="small"
              rowKey="user_id"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Activité récente">
            <Table
              dataSource={recentActivity}
              columns={activityColumns}
              pagination={false}
              size="small"
              rowKey="history_id"
            />
          </Card>
        </Col>
      </Row>

      {/* Statistiques par thématique */}
      <Row className="stats-row">
        <Col span={24}>
          <Card title="Statistiques par thématique">
            <Row gutter={[16, 16]}>
              {thematicStats.map((thematic) => (
                <Col span={8} key={thematic.id}>
                  <Card size="small">
                    {/* Icône supprimée (non fournie par l'API) */}
                    <h4>{thematic.name}</h4>
                    <p>Quiz complétés: {thematic.completedQuizzes}</p>
                    <p>Taux de réussite: {thematic.successRate}%</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default QuizStats;
