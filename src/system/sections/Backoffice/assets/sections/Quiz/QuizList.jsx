import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Spin,
  Alert,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  message,
  Select,
} from 'antd';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import questionServices from '../../../../../configurations/Services/questionServices.js';
import subThematicServices from '../../../../../configurations/Services/subThematicServices.js';

function QuizList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thematics, setThematics] = useState([]);
  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm] = Form.useForm();
  const [iconFiles, setIconFiles] = useState([]);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [qForm] = Form.useForm();

  const [subVisible, setSubVisible] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [subForm] = Form.useForm();

  const loadThematics = async () => {
    try {
      setLoading(true);
      const data = await thematicService.getAllThematics();
      const normalized = (data || []).map((t) => {
        let subs = [];
        try {
          subs =
            typeof t.sub_thematics === 'string'
              ? JSON.parse(t.sub_thematics)
              : t.sub_thematics || [];
        } catch {
          subs = [];
        }
        const questionCount = subs.reduce((acc, st) => {
          const qs = Array.isArray(st.questions) ? st.questions : [];
          return acc + qs.length;
        }, 0);

        // is_active = 1/0 (fallback sur t.view si boolean)
        const isActive =
          typeof t.is_active !== 'undefined'
            ? t.is_active
              ? 1
              : 0
            : typeof t.view === 'boolean'
              ? t.view
                ? 1
                : 0
              : (t.view ?? 1);

        return {
          ...t,
          sub_thematics: subs,
          subCount: subs.length,
          questionCount,
          is_active: isActive,
        };
      });
      setThematics(normalized);
    } catch (e) {
      console.error(e);
      setError('Erreur lors du chargement des quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThematics();
  }, []);

  if (loading) return <Spin style={{ margin: 24 }} />;
  if (error) return <Alert type="error" message={error} />;

  const openEdit = (record) => {
    setEditing(record);
    editForm.setFieldsValue({
      title: record.title || record.thematic_title || '',
      description: record.description || record.thematic_description || '',
      color_code: record.color_code || '#6366f1',
      // is_active 1/0 pour édition
      is_active:
        typeof record.is_active !== 'undefined'
          ? record.is_active
          : typeof record.view === 'boolean'
            ? record.view
              ? 1
              : 0
            : (record.view ?? 1),
    });
    setIconFiles([]);
    setEditVisible(true);
  };

  const submitEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('color_code', values.color_code || '#6366f1');
      // envoyer is_active (1/0)
      formData.append('is_active', Number(values.is_active) ? 1 : 0);
      if (iconFiles[0]) {
        formData.append('icon', iconFiles[0].originFileObj);
      }
      await thematicService.updateThematic(editing.thematic_id, formData);
      message.success('Thématique mise à jour');
      setEditVisible(false);
      setEditing(null);
      await loadThematics();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.error || 'Erreur mise à jour');
    }
  };

  const updateOrder = async (record) => {
    try {
      // ordre = is_active (1/0)
      const newActive =
        typeof record._nextActive !== 'undefined'
          ? Number(record._nextActive)
            ? 1
            : 0
          : typeof record.is_active !== 'undefined'
            ? Number(record.is_active)
              ? 1
              : 0
            : typeof record.view === 'boolean'
              ? record.view
                ? 1
                : 0
              : 1;

      const fd = new FormData();
      fd.append('title', record.title || record.thematic_title || '');
      fd.append('description', record.description || record.thematic_description || '');
      fd.append('color_code', record.color_code || '#6366f1');
      fd.append('is_active', newActive);
      await thematicService.updateThematic(record.thematic_id, fd);
      message.success('Ordre (is_active) mis à jour');
      await loadThematics();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.error || 'Erreur mise à jour de l’ordre');
    }
  };

  const openQuestionEdit = (q) => {
    setEditingQuestion(q);
    const a = Array.isArray(q.answers) && q.answers.length > 0 ? q.answers[0] : {};
    qForm.setFieldsValue({
      content: q.content,
      explanation: q.explanation,
      difficulty_level: q.difficulty_level,
      question_type: q.question_type || 'multiple_choice',
      points: q.points ?? 10,
      time_limit: q.time_limit ?? 30,
      media_url: q.media_url || null,

      answer_option1: a.answer_option1 || '',
      answer_option2: a.answer_option2 || '',
      answer_option3: a.answer_option3 || '',
      correct_option: a.correct_option ?? 1,
      answer_type: a.answer_type || 'text',
      answer_media_url: a.media_url || null,
      points_value: a.points_value ?? 1,
    });
    setQuestionVisible(true);
  };

  const submitQuestionEdit = async () => {
    try {
      const v = await qForm.validateFields();
      await questionServices.update(editingQuestion.question_id, {
        content: v.content,
        explanation: v.explanation,
        difficulty_level: v.difficulty_level,
        question_type: v.question_type,
        points: v.points,
        time_limit: v.time_limit,
        media_url: v.media_url || null,
      });
      await questionServices.updateAnswers(editingQuestion.question_id, {
        answer_option1: v.answer_option1,
        answer_option2: v.answer_option2,
        answer_option3: v.answer_option3,
        correct_option: v.correct_option,
        answer_type: v.answer_type,
        media_url: v.answer_media_url || null,
        points_value: v.points_value,
      });
      message.success('Question et réponses mises à jour');
      setQuestionVisible(false);
      setEditingQuestion(null);
      await loadThematics();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.error || 'Erreur mise à jour question');
    }
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer la thématique ?',
      content: `Cette action est irréversible: ${record.thematic_title || record.title}`,
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await thematicService.deleteThematic(record.thematic_id);
          message.success('Thématique supprimée');
          await loadThematics();
        } catch (e) {
          console.error(e);
          message.error(e?.response?.data?.error || 'Erreur suppression');
        }
      },
    });
  };

  const openSubCreate = (parentThematic) => {
    setEditingSub({ mode: 'create', thematic_id: parentThematic.thematic_id });
    subForm.setFieldsValue({
      title: '',
      description: '',
      difficulty_level: 'moyen',
      display_order: 0,
    });
    setSubVisible(true);
  };

  const openSubEdit = async (st) => {
    try {
      const sub = await subThematicServices.getById(st.sub_thematic_id);
      setEditingSub({ mode: 'edit', ...sub });
      subForm.setFieldsValue({
        title: sub.title,
        description: sub.description || '',
        difficulty_level: sub.difficulty_level || 'moyen',
        display_order: sub.display_order ?? 0,
      });
      setSubVisible(true);
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.error || 'Erreur de chargement de la sous-thématique');
    }
  };

  const submitSub = async () => {
    try {
      const values = await subForm.validateFields();
      if (editingSub?.mode === 'create') {
        await subThematicServices.create({
          thematic_id: editingSub.thematic_id,
          title: values.title,
          description: values.description || null,
          difficulty_level: values.difficulty_level,
          display_order: values.display_order ?? 0,
        });
        message.success('Sous-thématique créée');
      } else if (editingSub?.mode === 'edit') {
        await subThematicServices.update(editingSub.sub_thematic_id, {
          thematic_id: editingSub.thematic_id,
          title: values.title,
          description: values.description || null,
          difficulty_level: values.difficulty_level,
          display_order: values.display_order ?? 0,
        });
        message.success('Sous-thématique mise à jour');
      }
      setSubVisible(false);
      setEditingSub(null);
      await loadThematics();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.error || 'Erreur lors de l’enregistrement');
    }
  };

  const deleteSub = async (st) => {
    Modal.confirm({
      title: 'Supprimer la sous-thématique ?',
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await subThematicServices.delete(st.sub_thematic_id);
          message.success('Sous-thématique supprimée');
          await loadThematics();
        } catch (e) {
          console.error(e);
          message.error(e?.response?.data?.error || 'Erreur suppression');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Thématique',
      key: 'thematic_title',
      width: 220,
      render: (_, r) => r.title || r.thematic_title,
    },
    {
      title: 'Description',
      key: 'thematic_description',
      ellipsis: true,
      render: (_, r) => r.description || r.thematic_description,
    },
    {
      title: 'Couleur',
      dataIndex: 'color_code',
      key: 'color_code',
      render: (c) => <Tag color={c}>{c}</Tag>,
    },
    {
      title: 'Ordre (1/0)',
      key: 'is_active',
      width: 220,
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <InputNumber
            min={0}
            max={1}
            defaultValue={r.is_active}
            onChange={(val) => {
              r._nextActive = val;
            }}
          />
          <Button size="small" onClick={() => updateOrder(r)}>
            Mettre à jour
          </Button>
        </div>
      ),
    },
    { title: 'Sous-thématiques', dataIndex: 'subCount', key: 'subCount', width: 140 },
    { title: 'Questions', dataIndex: 'questionCount', key: 'questionCount', width: 120 },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => openEdit(record)} style={{ marginRight: 8 }}>
            Éditer
          </Button>
          <Button danger size="small" onClick={() => confirmDelete(record)}>
            Supprimer
          </Button>
        </>
      ),
    },
  ];

  const subColumns = [
    { title: 'Sous-thématique', dataIndex: 'title', key: 'title' },
    { title: 'Difficulté', dataIndex: 'difficulty_level', key: 'difficulty_level', width: 130 },
    {
      title: 'Questions',
      key: 'questions',
      width: 120,
      render: (_, st) => (Array.isArray(st.questions) ? st.questions.length : 0),
    },
  ];

  const subActionsColumn = {
    title: 'Actions',
    key: 'sub_actions',
    width: 200,
    render: (_, st) => (
      <>
        <Button size="small" onClick={() => openSubEdit(st)} style={{ marginRight: 8 }}>
          Éditer
        </Button>
        <Button danger size="small" onClick={() => deleteSub(st)}>
          Supprimer
        </Button>
      </>
    ),
  };

  const questionColumns = [
    { title: 'Question', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: 'Type', dataIndex: 'question_type', key: 'question_type', width: 140 },
    { title: 'Difficulté', dataIndex: 'difficulty_level', key: 'difficulty_level', width: 120 },
    { title: 'Points', dataIndex: 'points', key: 'points', width: 100 },
    { title: 'Temps (s)', dataIndex: 'time_limit', key: 'time_limit', width: 120 },
    {
      title: 'Réponses',
      key: 'answers',
      width: 120,
      render: (_, q) => (Array.isArray(q.answers) ? q.answers.length : 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, q) => (
        <>
          <Button size="small" onClick={() => openQuestionEdit(q)} style={{ marginRight: 8 }}>
            Éditer
          </Button>
          <Button
            danger
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Supprimer la question ?',
                okText: 'Supprimer',
                okButtonProps: { danger: true },
                cancelText: 'Annuler',
                onOk: async () => {
                  try {
                    await questionServices.delete(q.question_id);
                    message.success('Question supprimée');
                    await loadThematics();
                  } catch (e) {
                    console.error(e);
                    message.error(e?.response?.data?.error || 'Erreur suppression question');
                  }
                },
              });
            }}
          >
            Supprimer
          </Button>
        </>
      ),
    },
  ];

  const answersColumns = [
    { title: 'Option', dataIndex: 'label', key: 'label', width: 100 },
    { title: 'Texte', dataIndex: 'value', key: 'value', ellipsis: true },
    {
      title: 'Correcte',
      dataIndex: 'isCorrect',
      key: 'isCorrect',
      width: 120,
      render: (v) => (v ? <Tag color="green">Bonne réponse</Tag> : <Tag>—</Tag>),
    },
    { title: 'Points', dataIndex: 'points', key: 'points', width: 100 },
    {
      title: 'Media',
      dataIndex: 'media_url',
      key: 'media_url',
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            Voir
          </a>
        ) : (
          '—'
        ),
    },
  ];

  const mapAnswerToOptionRows = (answer) => {
    if (!answer) return [];
    const rows = [
      {
        key: '1',
        label: 'Option 1',
        value: answer.answer_option1,
        isCorrect: Number(answer.correct_option) === 1,
        points: answer.points_value,
        media_url: answer.media_url,
      },
      {
        key: '2',
        label: 'Option 2',
        value: answer.answer_option2,
        isCorrect: Number(answer.correct_option) === 2,
        points: answer.points_value,
        media_url: answer.media_url,
      },
      {
        key: '3',
        label: 'Option 3',
        value: answer.answer_option3,
        isCorrect: Number(answer.correct_option) === 3,
        points: answer.points_value,
        media_url: answer.media_url,
      },
    ];
    return rows.filter((r) => r.value !== null && r.value !== undefined && r.value !== '');
  };

  return (
    <Card title="Liste des Quiz">
      <Table
        dataSource={thematics}
        columns={columns}
        rowKey="thematic_id"
        expandable={{
          expandedRowRender: (record) => (
            <>
              <div style={{ marginBottom: 8 }}>
                <Button type="primary" onClick={() => openSubCreate(record)}>
                  Ajouter une sous-thématique
                </Button>
              </div>
              <Table
                dataSource={record.sub_thematics || []}
                columns={[...subColumns, subActionsColumn]}
                pagination={false}
                rowKey="sub_thematic_id"
                size="small"
                expandable={{
                  expandedRowRender: (st) => (
                    <Table
                      dataSource={Array.isArray(st.questions) ? st.questions : []}
                      columns={questionColumns}
                      pagination={false}
                      rowKey="question_id"
                      size="small"
                      expandable={{
                        expandedRowRender: (q) => {
                          const answers = Array.isArray(q.answers) ? q.answers : [];
                          if (answers.length === 0) {
                            return <div style={{ padding: 8 }}>Aucune réponse</div>;
                          }
                          const optionRows = mapAnswerToOptionRows(answers[0]);
                          return (
                            <Table
                              dataSource={optionRows}
                              columns={answersColumns}
                              pagination={false}
                              rowKey="key"
                              size="small"
                            />
                          );
                        },
                        rowExpandable: (q) => Array.isArray(q.answers) && q.answers.length > 0,
                      }}
                    />
                  ),
                  rowExpandable: (st) => Array.isArray(st.questions) && st.questions.length > 0,
                }}
              />
            </>
          ),
          rowExpandable: (record) => (record.sub_thematics || []).length > 0,
        }}
      />

      <Modal
        title="Éditer la thématique"
        open={editVisible}
        onCancel={() => {
          setEditVisible(false);
          setEditing(null);
        }}
        onOk={submitEdit}
        okText="Enregistrer"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Titre requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="color_code" label="Couleur (hex)">
            <Input placeholder="#6366f1" />
          </Form.Item>
          {/* is_active comme ordre binaire */}
          <Form.Item name="is_active" label="Ordre (1/0)" rules={[{ required: true }]}>
            <InputNumber min={0} max={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Icône">
            <Upload
              beforeUpload={() => false}
              fileList={iconFiles}
              onChange={({ fileList }) => setIconFiles(fileList)}
              accept="image/*"
              maxCount={1}
            >
              <Button>Choisir une icône</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          editingSub?.mode === 'edit' ? 'Éditer la sous-thématique' : 'Créer une sous-thématique'
        }
        open={subVisible}
        onCancel={() => {
          setSubVisible(false);
          setEditingSub(null);
        }}
        onOk={submitSub}
        okText={editingSub?.mode === 'edit' ? 'Enregistrer' : 'Créer'}
      >
        <Form form={subForm} layout="vertical">
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Titre requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="difficulty_level" label="Difficulté" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'facile', label: 'Facile' },
                { value: 'moyen', label: 'Moyen' },
                { value: 'difficile', label: 'Difficile' },
              ]}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item name="display_order" label="Ordre d’affichage">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Éditer la question"
        open={questionVisible}
        onCancel={() => {
          setQuestionVisible(false);
          setEditingQuestion(null);
        }}
        onOk={submitQuestionEdit}
        okText="Enregistrer"
        /* zIndex={2000} retiré pour éviter de masquer les dropdowns */
      >
        <Form form={qForm} layout="vertical">
          <Form.Item
            name="content"
            label="Intitulé"
            rules={[{ required: true, message: 'Intitulé requis' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="explanation" label="Explication">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="difficulty_level" label="Difficulté" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'facile', label: 'Facile' },
                { value: 'moyen', label: 'Moyen' },
                { value: 'difficile', label: 'Difficile' },
              ]}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item name="question_type" label="Type de question" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'multiple_choice', label: 'Choix multiple' },
                { value: 'single_choice', label: 'Choix unique' },
                { value: 'true_false', label: 'Vrai/Faux' },
                { value: 'fill_in_blank', label: 'Texte libre' },
              ]}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item name="points" label="Points">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="time_limit" label="Temps (s)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="media_url" label="Media (URL)">
            <Input placeholder="https://..." />
          </Form.Item>

          <h4>Réponses</h4>
          <Form.Item name="answer_option1" label="Option 1" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="answer_option2" label="Option 2" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="answer_option3" label="Option 3" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="correct_option" label="Bonne option" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 1, label: 'Option 1' },
                { value: 2, label: 'Option 2' },
                { value: 3, label: 'Option 3' },
              ]}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item name="answer_type" label="Type de réponse">
            <Select
              options={[
                { value: 'text', label: 'Texte' },
                { value: 'image', label: 'Image' },
                { value: 'audio', label: 'Audio' },
                { value: 'video', label: 'Vidéo' },
              ]}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item name="answer_media_url" label="Media réponse (URL)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="points_value" label="Points de la bonne réponse">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default QuizList;
