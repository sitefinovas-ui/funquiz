import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Alert, Table } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined, // Nouvelle icône pour les thématiques
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
    averageScore: 0, // ajout: score moyen (%)
  });
  const [thematicStats, setThematicStats] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showHeavy, setShowHeavy] = useState(false); // ajout: différer rendu lourd

  // Couleurs pour les icônes globales (correspondant au CSS)
  const iconColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const thematicColor = '#6366f1'; // Couleur unique pour les thématiques

  // Utilitaires d'affichage robustes
  const formatInt = (v) => Number(v ?? 0);
  const formatPercent = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(1) : '0.0';
  };

  useEffect(() => {
    fetchAllStats();
    // Diffère le rendu des sections lourdes pour améliorer LCP
    const run = () => setShowHeavy(true);
    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 1000 });
    } else {
      setTimeout(run, 150);
    }
  }, []);

  const asNumber = (val, field) => {
    const v = Number(val);
    if (!Number.isFinite(v)) {
      console.warn(`[QuizStats] Champ ${field} invalide`, val);
      return 0;
    }
    return v;
  };

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [globalRes, thematicsRes, rankRes, activityRes] = await Promise.allSettled([
        quizStatsServices.getGlobalStats(),
        quizStatsServices.getThematicStats(),
        quizStatsServices.getRankings(),
        quizStatsServices.getRecentActivity(),
      ]);

      const global = globalRes.status === 'fulfilled' ? globalRes.value : null;
      const thematics = thematicsRes.status === 'fulfilled' ? thematicsRes.value : [];
      const rank = rankRes.status === 'fulfilled' ? rankRes.value : [];
      const activity = activityRes.status === 'fulfilled' ? activityRes.value : [];

      const rawGlobal = global?.data ?? global ?? {};
      const g = Array.isArray(rawGlobal) ? (rawGlobal[0] || {}) : rawGlobal || {};

      ['total_participants', 'total_questions', 'active_thematics', 'avg_success_rate', 'avg_score'].forEach((k) => {
        if (!(k in g)) console.warn(`[QuizStats] Champ manquant dans /stats/global: ${k}`);
      });

      setGlobalStats({
        totalUsers: asNumber(g.total_participants, 'total_participants'),
        totalQuestions: asNumber(g.total_questions, 'total_questions'),
        activeThematics: asNumber(g.active_thematics, 'active_thematics'),
        averageSuccessRate: asNumber(g.avg_success_rate, 'avg_success_rate'),
        averageScore: asNumber(g.avg_score, 'avg_score'),
      });

      // Statistiques par thématique
      const thematicsData = (thematics?.data || thematics || []).map((t) => ({
        id: t.thematic_id,
        name: t.thematic_title,
        completedQuizzes: formatInt(t.quiz_count),
        successRate: t.success_rate ? Number(t.success_rate) : 0,
      }));
      setThematicStats(thematicsData);

      // Classement des utilisateurs
      const rankingsData = (rank?.data || rank || []).map((r) => ({
        user_id: r.user_id,
        username: r.full_name || r.username || 'Anonyme',
        score: formatInt(r.total_points),
      }));
      setRankings(rankingsData);

      // Activité récente
      const activityData = (activity?.data || activity || []).map((a) => ({
        history_id: a.history_id,
        date: a.played_at,
        username: a.full_name || a.username || 'Anonyme',
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

  if (loading) return <Spin size="large" className="stats-loader" style={{ display: 'block', margin: '50px auto' }} />;
  if (error) return <Alert message={error} type="error" showIcon />;

  // Colonnes du classement
  const rankColumns = [
    {
      title: 'Rang',
      dataIndex: 'rank',
      key: 'rank',
      // Style professionnel pour les premiers rangs
      render: (text, record, index) => {
        const rank = index + 1;
        if (rank === 1) return <TrophyOutlined style={{ color: '#ffd700', fontSize: '16px' }} />;
        if (rank === 2) return <TrophyOutlined style={{ color: '#c0c0c0', fontSize: '16px' }} />;
        if (rank === 3) return <TrophyOutlined style={{ color: '#cd7f32', fontSize: '16px' }} />;
        return rank;
      },
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
    },
  ];

  // Colonnes de l'activité récente
  const activityColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }),
      width: 100,
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
    },
  ];

  return (
    <div className="quiz-stats-container">
      <h1>Tableau de bord des Quiz</h1>

      {/* Statistiques globales (4 Cards) */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <UserOutlined className="stats-icon" style={{ color: iconColors[0] }} />
            <h3 className="fs-6">Participants Totaux</h3>
            <p className="stats-number">{Number(globalStats?.totalUsers ?? 0).toLocaleString('fr-FR')}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <FileTextOutlined className="stats-icon" style={{ color: iconColors[1] }} />
            <h3 className="fs-6">Questions Totales</h3>
            <p className="stats-number">{Number(globalStats?.totalQuestions ?? 0).toLocaleString('fr-FR')}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <TrophyOutlined className="stats-icon" style={{ color: iconColors[2] }} />
            <h3 className="fs-6">Thématiques Actives</h3>
            <p className="stats-number">{Number(globalStats?.activeThematics ?? 0).toLocaleString('fr-FR')}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <CheckCircleOutlined className="stats-icon" style={{ color: iconColors[3] }} />
            <h3 className="fs-6">Réussite Moyenne</h3>
            <p className="stats-number">{Number.isFinite(Number(globalStats?.averageSuccessRate)) ? Number(globalStats?.averageSuccessRate).toFixed(1) : '0.0'}%</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <ClockCircleOutlined className="stats-icon" style={{ color: iconColors[3] }} />
            <h3 className="fs-6">Score Moyen (%)</h3>
            <p className="stats-number">{Number.isFinite(Number(globalStats?.averageScore)) ? Number(globalStats?.averageScore).toFixed(1) : '0.0'}%</p>
          </Card>
        </Col>
      </Row>

      {/* Classement et Activité Récente (2 Tables) — différé pour LCP */}
      {showHeavy && (
        <Row gutter={[24, 24]} className="stats-row">
          <Col xs={24} lg={12}>
            <Card title="Top 10 du classement" bodyStyle={{ padding: '0px' }}>
              <Table
                dataSource={rankings.slice(0, 10)}
                columns={rankColumns}
                pagination={false}
                size="small"
                rowKey="user_id"
                scroll={{ x: 'max-content', y: 300 }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Activité récente" bodyStyle={{ padding: '0px' }}>
              <Table
                dataSource={recentActivity.slice(0, 10)}
                columns={activityColumns}
                pagination={false}
                size="small"
                rowKey="history_id"
                scroll={{ x: 'max-content', y: 300 }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Statistiques par thématique (Grille) — différé pour LCP */}
      {showHeavy && (
        <Row gutter={[24, 24]} className="stats-row">
          <Col span={24}>
            <Card title="Statistiques Détaillées par Thématique">
              <Row gutter={[16, 16]}>
                {thematicStats.map((thematic) => (
                  <Col xs={24} sm={12} md={8} key={thematic.id}>
                    <Card size="small" hoverable>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <FileTextOutlined style={{ color: thematicColor, fontSize: '18px', marginRight: 8 }} />
                          <h4>{thematic.name}</h4>
                      </div>
                      <p>Quiz complétés: <strong>{thematic.completedQuizzes.toLocaleString('fr-FR')}</strong></p>
                      <p>Taux de réussite: <strong style={{ color: thematicColor }}>{thematic.successRate}%</strong></p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default QuizStats;
