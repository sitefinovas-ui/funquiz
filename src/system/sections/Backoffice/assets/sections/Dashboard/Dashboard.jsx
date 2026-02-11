import { useEffect, useState, useRef } from 'react';
import {
  FaUserShield,
  FaTrophy,
  FaClock,
  FaUsers,
  FaChartLine,
  FaBolt,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { AiTwotoneMessage } from 'react-icons/ai';
import { TfiCommentsSmiley } from 'react-icons/tfi';
import { GiRapidshareArrow } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import pointService from '../../../../../configurations/Services/pointService.js';
import messageServices from '../../../../../configurations/Services/messageServices.js';
import commentServices from '../../../../../configurations/Services/commentServices.js';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import usersServices from '../../../../../configurations/Services/authServices.js';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import './Dashboard.css';

const HomeDash = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    inscriptions: 0,
    messages: 0,
    commentaires: 0,
    partages: 0,
    totalUsers: 0,
    activeUsers: 0,
    changes: { inscriptions: '0%', messages: '0%', commentaires: '0%', partages: '0%' },
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topQuizzes, setTopQuizzes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);

  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Tableau de bord';
    fetchDashboardData();
  }, []);

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [allUsers, usersData, messagesData, commentsData, thematicsData] = await Promise.all([
        usersServices.getAllUsers(),
        pointService.getAllUsersPoints(),
        messageServices.getAllMessages(),
        commentServices.getCommentsWithUserAndQuiz(),
        thematicService.getAllThematics(),
      ]);

      const users = usersData.data || [];
      const thematics = thematicsData || [];

      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const todayStats = {
        inscriptions: allUsers.filter((u) => new Date(u.created_at) >= todayStart).length,
        messages: messagesData.filter((m) => new Date(m.created_at) >= todayStart).length,
        commentaires: commentsData.filter((c) => new Date(c.created_at) >= todayStart).length,
        partages: users.filter(
          (u) => u.total_games_played > 0 && new Date(u.last_activity) >= todayStart
        ).length,
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter((u) => {
          const lastActivity = new Date(u.last_activity || u.created_at);
          const daysDiff = (today - lastActivity) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length,
      };

      const yesterdayStats = {
        inscriptions: allUsers.filter((u) => {
          const date = new Date(u.created_at);
          return date >= yesterdayStart && date < todayStart;
        }).length,
        messages: messagesData.filter((m) => {
          const date = new Date(m.created_at);
          return date >= yesterdayStart && date < todayStart;
        }).length,
        commentaires: commentsData.filter((c) => {
          const date = new Date(c.created_at);
          return date >= yesterdayStart && date < todayStart;
        }).length,
        partages: users.filter((u) => {
          const date = new Date(u.last_activity);
          return u.total_games_played > 0 && date >= yesterdayStart && date < todayStart;
        }).length,
      };

      const changes = {
        inscriptions: calculatePercentageChange(
          todayStats.inscriptions,
          yesterdayStats.inscriptions
        ),
        messages: calculatePercentageChange(todayStats.messages, yesterdayStats.messages),
        commentaires: calculatePercentageChange(
          todayStats.commentaires,
          yesterdayStats.commentaires
        ),
        partages: calculatePercentageChange(todayStats.partages, yesterdayStats.partages),
      };

      setStats({ ...todayStats, changes });

      const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const weeklyStats = [];

      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(todayStart);
        dayDate.setDate(dayDate.getDate() - i);
        const nextDay = new Date(dayDate);
        nextDay.setDate(nextDay.getDate() + 1);

        weeklyStats.push({
          jour: weekDays[dayDate.getDay()],
          inscriptions: allUsers.filter((u) => {
            const date = new Date(u.created_at);
            return date >= dayDate && date < nextDay;
          }).length,
          messages: messagesData.filter((m) => {
            const date = new Date(m.created_at);
            return date >= dayDate && date < nextDay;
          }).length,
          commentaires: commentsData.filter((c) => {
            const date = new Date(c.created_at);
            return date >= dayDate && date < nextDay;
          }).length,
        });
      }

      setWeeklyData(weeklyStats);

      const colors = ['#7a3db8', '#9f7aea', '#c4b5fd', '#94a3b8', '#64748b', '#b794f4'];
      const categoryStats = thematics
        .map((thematic, index) => ({
          name: thematic.thematic_title,
          value: users.filter((u) => u.favorite_category === thematic.thematic_id).length,
          color: thematic.color_code || colors[index % colors.length],
        }))
        .filter((cat) => cat.value > 0)
        .sort((a, b) => b.value - a.value);

      if (categoryStats.length === 0) {
        categoryStats.push({ name: 'Sans catégorie', value: users.length || 1, color: '#64748b' });
      }

      setCategoryData(categoryStats);

      const quizStats = thematics
        .map((thematic) => {
          const thematicUsers = users.filter(
            (u) =>
              u.favorite_category === thematic.thematic_id &&
              u.total_games_played &&
              u.total_games_played > 0
          );

          const totalGames = thematicUsers.reduce(
            (acc, u) => acc + (parseInt(u.total_games_played) || 0),
            0
          );
          const avgCompletion =
            thematicUsers.length > 0
              ? thematicUsers.reduce((acc, u) => acc + (parseFloat(u.average_completion) || 0), 0) /
                thematicUsers.length
              : 0;

          return {
            name: thematic.thematic_title || 'Quiz sans titre',
            color: thematic.color_code || '#7a3db8',
            participants: thematicUsers.length,
            totalGames: totalGames,
            note: avgCompletion > 0 ? (avgCompletion / 20).toFixed(1) : '0.0',
          };
        })
        .filter((quiz) => quiz.participants > 0 || quiz.totalGames > 0)
        .sort((a, b) => b.totalGames - a.totalGames || b.participants - a.participants)
        .slice(0, 5);

      if (quizStats.length === 0 && thematics.length > 0) {
        thematics.slice(0, 5).forEach((thematic, index) => {
          quizStats.push({
            name: thematic.thematic_title || `Quiz ${index + 1}`,
            color: thematic.color_code || colors[index % colors.length],
            participants: 0,
            totalGames: 0,
            note: '0.0',
          });
        });
      }

      setTopQuizzes(quizStats);

      const recentActivities = [...messagesData, ...commentsData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8)
        .map((activity) => {
          const thematic = thematics.find((t) => t.thematic_id === activity.thematic_id);
          return {
            user: `${activity.first_name || 'Utilisateur'} ${(activity.name || 'A').charAt(0)}.`,
            avatar: activity.first_name ? activity.first_name.charAt(0).toUpperCase() : 'U',
            action: activity.content ? 'a commenté' : 'a envoyé un message',
            quiz: thematic ? thematic.thematic_title : 'Quiz général',
            time: formatTimeAgo(new Date(activity.created_at)),
          };
        });

      setRecentActivity(recentActivities);

      const months = [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sep',
        'Oct',
        'Nov',
        'Déc',
      ];
      const monthlyStats = [];
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

        monthlyStats.push({
          mois: months[monthIndex],
          utilisateurs: allUsers.filter((u) => {
            const date = new Date(u.created_at);
            return date.getMonth() === monthIndex && date.getFullYear() === year;
          }).length,
        });
      }

      setMonthlyGrowth(monthlyStats);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de chargement');
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return 'maintenant';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}j`;
  };

  if (loading) {
    return (
      <div className="enterprise-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enterprise-error">
        <div className="error-icon">!</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="enterprise-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-title">
            <h1>Tableau de bord</h1>
            <p>
              Aperçu des performances ·{' '}
              {new Date().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="header-metrics">
            <div className="header-metric">
              <div className="metric-value">{stats.totalUsers}</div>
              <div className="metric-label">Utilisateurs totaux</div>
            </div>
            <div className="header-metric">
              <div className="metric-value">{stats.activeUsers}</div>
              <div className="metric-label">Actifs (7 jours)</div>
            </div>
            <div className="header-metric">
              <div className="metric-value">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}%
              </div>
              <div className="metric-label">Taux d'engagement</div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-cards">
          {[
            {
              title: 'Nouvelles inscriptions',
              value: stats.inscriptions,
              change: stats.changes.inscriptions,
              icon: FaUserShield,
            },
            {
              title: 'Messages reçus',
              value: stats.messages,
              change: stats.changes.messages,
              icon: AiTwotoneMessage,
            },
            {
              title: 'Commentaires postés',
              value: stats.commentaires,
              change: stats.changes.commentaires,
              icon: TfiCommentsSmiley,
            },
            {
              title: 'Engagements actifs',
              value: stats.partages,
              change: stats.changes.partages,
              icon: GiRapidshareArrow,
            },
          ].map((card, index) => {
            const Icon = card.icon;
            const isPositive = card.change.includes('+');

            return (
              <div key={index} className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon">
                    <Icon />
                  </div>
                  <div className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                    {card.change}
                  </div>
                </div>
                <div className="kpi-value">{card.value}</div>
                <div className="kpi-title">{card.title}</div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="content-grid">
          {/* Weekly Chart */}
          <div className="chart-box chart-weekly">
            <div className="box-header">
              <h3>Activité hebdomadaire</h3>
              <span className="box-subtitle">7 derniers jours</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7a3db8" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7a3db8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9f7aea" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#9f7aea" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d3c7" vertical={false} />
                <XAxis
                  dataKey="jour"
                  stroke="#7a6f64"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                />
                <YAxis stroke="#7a6f64" style={{ fontSize: '12px', fontWeight: '500' }} />
                <Tooltip
                  contentStyle={{
                    background: '#fff9f3',
                    border: '1px solid #e6d9cd',
                    borderRadius: '8px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                <Area
                  type="monotone"
                  dataKey="inscriptions"
                  stroke="#7a3db8"
                  strokeWidth={2}
                  fill="url(#grad1)"
                  name="Inscriptions"
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#9f7aea"
                  strokeWidth={2}
                  fill="url(#grad2)"
                  name="Messages"
                />
                <Area
                  type="monotone"
                  dataKey="commentaires"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#grad3)"
                  name="Commentaires"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Growth */}
          <div className="chart-box chart-monthly">
            <div className="box-header">
              <h3>Croissance mensuelle</h3>
              <span className="box-subtitle">Nouveaux utilisateurs</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d3c7" vertical={false} />
                <XAxis
                  dataKey="mois"
                  stroke="#7a6f64"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                />
                <YAxis stroke="#7a6f64" style={{ fontSize: '12px', fontWeight: '500' }} />
                <Tooltip
                  contentStyle={{
                    background: '#fff9f3',
                    border: '1px solid #e6d9cd',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="utilisateurs" fill="#7a3db8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Categories */}
          <div className="chart-box chart-categories">
            <div className="box-header">
              <h3>Répartition par catégorie</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff9f3',
                    border: '1px solid #e6d9cd',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="category-list">
              {categoryData.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="category-item">
                  <span className="category-dot" style={{ background: cat.color }}></span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-value">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Quiz */}
          <div className="chart-box chart-top">
            <div className="box-header">
              <FaTrophy className="header-icon" />
              <h3>Top Quiz</h3>
            </div>
            <div className="quiz-list">
              {topQuizzes.length > 0 ? (
                topQuizzes.map((quiz, index) => (
                  <div key={index} className="quiz-item">
                    <div className="quiz-rank">{index + 1}</div>
                    <div className="quiz-details">
                      <div className="quiz-name">{quiz.name}</div>
                      <div className="quiz-stats">
                        {quiz.participants} joueur{quiz.participants > 1 ? 's' : ''} ·{' '}
                        {quiz.totalGames} partie{quiz.totalGames > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="quiz-score">★ {quiz.note}</div>
                  </div>
                ))
              ) : (
                <div className="empty-content">
                  <FaTrophy />
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="chart-box chart-activity">
            <div className="box-header">
              <FaClock className="header-icon" />
              <h3>Activité récente</h3>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-row">
                  <div className="activity-avatar">{activity.avatar}</div>
                  <div className="activity-content">
                    <div className="activity-user">
                      <strong>{activity.user}</strong> {activity.action}
                    </div>
                    <div className="activity-details">
                      {activity.quiz} · {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomeDash;
