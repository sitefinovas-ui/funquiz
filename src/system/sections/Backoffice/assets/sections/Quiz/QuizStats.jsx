import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Alert, Table } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import quizStatsServices from '../../../../../configurations/Services/quizStatsServices.js';
import './QuizStats.css';

const QuizStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    activeThematics: 0,
    averageSuccessRate: 0,
    averageScore: 0,
  });
  const [thematicStats, setThematicStats] = useState([]);
  const [thematicLoading, setThematicLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showHeavy, setShowHeavy] = useState(false);

  const iconColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const thematicColor = '#6366f1';

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const formatInt = (v) => Number(v ?? 0);
  const asNumber = (val, field) => {
    const v = Number(val);
    if (!Number.isFinite(v)) {
      console.warn(`[QuizStats] Champ ${field} invalide`, val);
      return 0;
    }
    return v;
  };

  useEffect(() => {
    fetchGlobalStats();
    fetchThematicStats();
    fetchRankings();
    fetchRecentActivity();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const data = await quizStatsServices.getGlobalStats();
      const rawGlobal = data?.data ?? data ?? {};
      const g = Array.isArray(rawGlobal) ? (rawGlobal[0] || {}) : rawGlobal || {};
      
      setGlobalStats({
        totalUsers: asNumber(g.total_participants, 'total_participants'),
        totalQuestions: asNumber(g.total_questions, 'total_questions'),
        activeThematics: asNumber(g.active_thematics, 'active_thematics'),
        averageSuccessRate: asNumber(g.avg_success_rate, 'avg_success_rate'),
        averageScore: asNumber(g.avg_score, 'avg_score'),
      });
    } catch (err) {
      console.error('Erreur stats globales:', err);
    }
  };

  const fetchThematicStats = async () => {
    try {
      setThematicLoading(true);
      const data = await quizStatsServices.getThematicStats();
      const thematicsData = (data?.data || data || []).map((t) => ({
        id: t.thematic_id,
        name: t.thematic_title,
        completedQuizzes: formatInt(t.quiz_count),
        successRate: t.success_rate ? Number(t.success_rate) : 0,
      }));
      setThematicStats(thematicsData);
    } catch (err) {
      console.error('Erreur stats thématiques:', err);
    } finally {
      setThematicLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      const data = await quizStatsServices.getRankings();
      const rankingsData = (data?.data || data || []).map((r) => ({
        user_id: r.user_id,
        username: r.full_name || r.username || 'Anonyme',
        score: formatInt(r.total_points),
      }));
      setRankings(rankingsData);
    } catch (err) {
      console.error('Erreur classement:', err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const data = await quizStatsServices.getRecentActivity();
      const activityData = (data?.data || data || []).map((a) => ({
        history_id: a.history_id,
        date: a.played_at,
        username: a.full_name || a.username || 'Anonyme',
        quizName: `${a.quiz_title} · ${a.thematic_title}`,
        score: `${a.score}/${a.max_score}`,
      }));
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Erreur activité récente:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <Alert message={error} type="error" showIcon />;

  const rankColumns = [
    {
      title: 'Rang',
      dataIndex: 'rank',
      key: 'rank',
      render: (text, record, index) => {
        const rank = index + 1;
        if (rank === 1) return <TrophyOutlined style={{ color: '#ffd700', fontSize: '16px' }} />;
        if (rank === 2) return <TrophyOutlined style={{ color: '#c0c0c0', fontSize: '16px' }} />;
        if (rank === 3) return <TrophyOutlined style={{ color: '#cd7f32', fontSize: '16px' }} />;
        return <span style={{ fontWeight: 600 }}>{rank}</span>;
      },
      width: 60,
    },
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Score Total',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
      defaultSortOrder: 'descend',
      render: (score) => <strong style={{ color: thematicColor }}>{score.toLocaleString()}</strong>,
    },
  ];

  const activityColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => {
        const d = date ? new Date(date) : null;
        if (!d || Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      },
      width: 140,
    },
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
    },
    {
      title: 'Quiz',
      dataIndex: 'quizName',
      key: 'quizName',
      ellipsis: true,
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (score) => <span style={{ fontWeight: 600 }}>{score}</span>,
    },
  ];

  return (
    <div className="quiz-stats-container">
      <h2 className="quiz-stats-title">Statistiques</h2>

      {/* Statistiques globales */}
      <div className="quiz-kpis">
        <Card className="quiz-kpiCard" loading={loading}>
          <div className="kpi-header">
            <div className="kpi-icon-wrapper" style={{ background: hexToRgba(iconColors[0], 0.1), color: iconColors[0] }}>
              <UserOutlined />
            </div>
          </div>
          <div>
            <h3 className="kpi-label">Participants totaux</h3>
            <p className="kpi-value">{Number(globalStats?.totalUsers ?? 0).toLocaleString('fr-FR')}</p>
          </div>
        </Card>

        <Card className="quiz-kpiCard" loading={loading}>
          <div className="kpi-header">
            <div className="kpi-icon-wrapper" style={{ background: hexToRgba(iconColors[1], 0.1), color: iconColors[1] }}>
              <FileTextOutlined />
            </div>
          </div>
          <div>
            <h3 className="kpi-label">Questions totales</h3>
            <p className="kpi-value">{Number(globalStats?.totalQuestions ?? 0).toLocaleString('fr-FR')}</p>
          </div>
        </Card>

        <Card className="quiz-kpiCard" loading={loading}>
          <div className="kpi-header">
            <div className="kpi-icon-wrapper" style={{ background: hexToRgba(iconColors[2], 0.1), color: iconColors[2] }}>
              <TrophyOutlined />
            </div>
          </div>
          <div>
            <h3 className="kpi-label">Thématiques actives</h3>
            <p className="kpi-value">{Number(globalStats?.activeThematics ?? 0).toLocaleString('fr-FR')}</p>
          </div>
        </Card>

        <Card className="quiz-kpiCard" loading={loading}>
          <div className="kpi-header">
            <div className="kpi-icon-wrapper" style={{ background: hexToRgba(iconColors[3], 0.1), color: iconColors[3] }}>
              <CheckCircleOutlined />
            </div>
          </div>
          <div>
            <h3 className="kpi-label">Réussite moyenne</h3>
            <p className="kpi-value">
              {Number.isFinite(Number(globalStats?.averageSuccessRate))
                ? Number(globalStats?.averageSuccessRate).toFixed(1)
                : '0.0'}%
            </p>
          </div>
        </Card>

        <Card className="quiz-kpiCard" loading={loading}>
          <div className="kpi-header">
            <div className="kpi-icon-wrapper" style={{ background: hexToRgba(iconColors[4], 0.1), color: iconColors[4] }}>
              <ClockCircleOutlined />
            </div>
          </div>
          <div>
            <h3 className="kpi-label">Score moyen (%)</h3>
            <p className="kpi-value">
              {Number.isFinite(Number(globalStats?.averageScore))
                ? Number(globalStats?.averageScore).toFixed(1)
                : '0.0'}%
            </p>
          </div>
        </Card>
      </div>

      {/* Classement et Activité Récente */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} lg={12}>
          <Card title="Top 10 du classement" className="stats-section-card" styles={{ body: { padding: '0px' } }}>
            <Table
              className="stats-table"
              dataSource={rankings.slice(0, 10)}
              columns={rankColumns}
              pagination={false}
              size="middle"
              rowKey="user_id"
              loading={loading}
              scroll={{ x: 'max-content', y: 350 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Activité récente" className="stats-section-card" styles={{ body: { padding: '0px' } }}>
            <Table
              className="stats-table"
              dataSource={recentActivity.slice(0, 10)}
              columns={activityColumns}
              pagination={false}
              size="middle"
              rowKey="history_id"
              loading={loading}
              scroll={{ x: 'max-content', y: 350 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Statistiques par thématique */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col span={24}>
          <Card title="Statistiques Détaillées par Thématique" className="stats-section-card">
            <Row gutter={[20, 20]}>
              {thematicLoading ? (
                // Skeletons pour les thématiques
                Array.from({ length: 4 }).map((_, i) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={i}>
                    <Card loading={true} className="thematic-card" />
                  </Col>
                ))
              ) : (
                thematicStats.map((thematic) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={thematic.id}>
                    <Card className="thematic-card" hoverable>
                      <div className="thematic-header">
                        <div className="thematic-icon">
                          <FileTextOutlined />
                        </div>
                        <h4 className="thematic-title">{thematic.name}</h4>
                      </div>
                      
                      <div className="thematic-stat-row">
                        <span>Quiz complétés</span>
                        <span className="thematic-stat-value">{thematic.completedQuizzes.toLocaleString('fr-FR')}</span>
                      </div>
                      
                      <div className="thematic-stat-row">
                        <span>Taux de réussite</span>
                        <span className="thematic-stat-value">{thematic.successRate}%</span>
                      </div>
                      
                      <div className="progress-bg">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min(thematic.successRate, 100)}%` }}
                        />
                      </div>
                    </Card>
                  </Col>
                )))}
              </Row>
            </Card>
          </Col>
        </Row>
    </div>
  );
};

export default QuizStats;
