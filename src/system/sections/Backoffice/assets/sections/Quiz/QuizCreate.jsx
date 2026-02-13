import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Upload, Button, message, Radio, Space, Modal } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { downloadExampleExcel } from './download_quiz.js';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import subThematicServices from '../../../../../configurations/Services/subThematicServices.js';
import questionServices from '../../../../../configurations/Services/questionServices.js';
import * as XLSX from 'xlsx';

// Fonction utilitaire déplacée en dehors du composant
function normalizeQuestionType(valRaw) {
  const v = String(valRaw || '').trim().toLowerCase();
  const map = {
    qcm: 'multiple_choice',
    'choix multiple': 'multiple_choice',
    'choix unique': 'single_choice',
    'vrai/faux': 'true_false',
    'vrai faux': 'true_false',
    vf: 'true_false',
    'texte libre': 'fill_in_blank',
    texte: 'fill_in_blank',
    // valeurs déjà correctes
    multiple_choice: 'multiple_choice',
    single_choice: 'single_choice',
    true_false: 'true_false',
    fill_in_blank: 'fill_in_blank',
  };
  return map[v] || 'multiple_choice';
}

function normalizeDifficultyLevel(valRaw) {
  const v = String(valRaw || '').trim().toLowerCase();
  if (v === 'facile' || v === 'moyen' || v === 'difficile') return v;
  return 'moyen';
}

function QuizCreate() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const handleCloseErrorModal = () => setErrorModalOpen(false);

  // Validation du quiz
  const validateQuiz = (values) => {
    const errors = [];
    const { title, sub_thematics = [] } = values;

    if (!title || String(title).trim() === '') {
      errors.push('Titre de la thématique requis.');
    }
    if (!Array.isArray(sub_thematics) || sub_thematics.length === 0) {
      errors.push('Au moins une sous‑thématique est requise.');
    } else {
      sub_thematics.forEach((st, i) => {
        if (!st?.title || String(st.title).trim() === '') {
          errors.push(`Sous‑thématique #${i + 1}: titre requis.`);
        }
        const questions = st?.questions || [];
        if (!Array.isArray(questions) || questions.length === 0) {
          errors.push(`Sous‑thématique #${i + 1}: au moins une question est requise.`);
          return;
        }
        questions.forEach((q, j) => {
          if (!q?.content || String(q.content).trim() === '') {
            errors.push(`Question #${j + 1} de la sous‑thématique #${i + 1}: intitulé requis.`);
          }
          ['answer_option1', 'answer_option2', 'answer_option3'].forEach((key, k) => {
            if (!q?.[key] || String(q[key]).trim() === '') {
              errors.push(`Question #${j + 1} de la sous‑thématique #${i + 1}: réponse ${k + 1} requise.`);
            }
          });
          const co = Number(q?.correct_option);
          if (![1, 2, 3].includes(co)) {
            errors.push(`Question #${j + 1} de la sous‑thématique #${i + 1}: "Bonne option" doit être 1, 2 ou 3.`);
          }
          const points = Number(q?.points ?? 10);
          const time = Number(q?.time_limit ?? 30);
          const pointsValue = Number(q?.points_value ?? 1);
          if (Number.isNaN(points) || points < 0) {
            errors.push(`Question #${j + 1} de la sous‑thématique #${i + 1}: points doivent être >= 0.`);
          }
          if (Number.isNaN(time) || time < 0) {
            errors.push(`Question #${j + 1} de la sous‑thématique #${i + 1}: temps (s) doit être >= 0.`);
          }
          if (Number.isNaN(pointsValue) || pointsValue < 0) {
            errors.push(`Question #${j + 1} de la sous‑thématique #${i + 1}: points bonne réponse >= 0.`);
          }
        });
      });
    }

    return errors;
  };

  // Export vers Excel
  const exportToExcel = (values) => {
    try {
      const {
        title,
        description = '',
        color_code = '#6366f1',
        display_order = 0,
        sub_thematics = [],
      } = values;

      const rows = [];
      sub_thematics.forEach((st) => {
        const {
          title: stTitle,
          description: stDesc = '',
          difficulty_level: stDiff = 'moyen',
          display_order: stOrder = 0,
          questions = [],
        } = st || {};
        questions.forEach((q) => {
          rows.push({
            'Thématique': title || '',
            'Description thématique': description || '',
            'Couleur': color_code || '#6366f1',
            'Ordre thématique': Number(display_order ?? 0),

            'Sous-thématique': stTitle || '',
            'Description sous-thématique': stDesc || '',
            'Difficulté': stDiff || 'moyen',
            'Ordre sous-thématique': Number(stOrder ?? 0),

            'Question': q?.content || '',
            'Explication': q?.explanation || '',
            'Type': q?.question_type || 'multiple_choice',
            'Points': Number(q?.points ?? 10),
            'Temps': Number(q?.time_limit ?? 30),
            'Media (URL)': q?.media_url || '',

            'Réponse 1': q?.answer_option1 || '',
            'Réponse 2': q?.answer_option2 || '',
            'Réponse 3': q?.answer_option3 || '',
            'Bonne option': Number(q?.correct_option ?? 1),

            'Type de réponse': q?.answer_type || 'text',
            'Media réponse (URL)': q?.answer_media_url || '',
            'Points bonne réponse': Number(q?.points_value ?? 1),
          });
        });
      });

      if (rows.length === 0) {
        message.warning('Aucune question à exporter.');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Quiz');

      const safe = String(title || 'quiz').replace(/[^a-zA-Z0-9-_]+/g, '_');
      XLSX.writeFile(wb, `quiz_export_${safe}.xlsx`);
      message.success('Fichier Excel généré');
    } catch (e) {
      console.error(e);
      message.error(e?.message || 'Erreur lors de la génération Excel');
    }
  };

  // Helpers: normaliser titres pour comparer proprement
  const normalizeTitle = (s) =>
    s
      ? s.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : '';

  const normalizeTitleStrict = (s) =>
    s
      ? s
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
      : '';

  // Helpers: trouver IDs existants par titre (insensible à la casse/accents/espaces)
  const findExistingThematicIdByTitle = async (title) => {
    const t = normalizeTitle(title);
    if (!t) return null;
    try {
      const list = await thematicService.getAllParamThematics();
      const arr = Array.isArray(list) ? list : list?.data || [];
      const found = arr.find((item) => normalizeTitle(item?.title) === t);
      return found?.thematic_id ?? found?.id ?? null;
    } catch {
      return null;
    }
  };

  const findExistingSubThematicIdByTitle = async (thematic_id, title) => {
    const st = normalizeTitle(title);
    if (!thematic_id || !st) return null;
    try {
      const list = await subThematicServices.getAll(thematic_id);
      const arr = Array.isArray(list) ? list : list?.data || [];
      const found = arr.find((item) => normalizeTitle(item?.title) === st);
      return found?.sub_thematic_id ?? found?.id ?? null;
    } catch {
      return null;
    }
  };

  // Soumission du formulaire
  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      // Validation stricte avant création
      const errors = validateQuiz(values);
      if (errors.length) {
        setErrorMessages(errors);
        setErrorModalOpen(true);
        setSubmitting(false);
        return;
      }

      // 1) Trouver ou créer la thématique (cumul si déjà existante)
      let thematic_id = await findExistingThematicIdByTitle(values.title);

      if (!thematic_id) {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('color_code', values.color_code || '#6366f1');
        formData.append('display_order', values.display_order ?? 0);
        if (fileList[0]) {
          formData.append('icon', fileList[0].originFileObj);
        }
        const tRes = await thematicService.createThematic(formData);
        thematic_id =
          tRes?.thematic_id ?? tRes?.data?.thematic_id ?? tRes?.data?.data?.thematic_id;
        if (!thematic_id) throw new Error('thematic_id introuvable');
      }

      // 2) Trouver ou créer les sous-thématiques + ajouter les questions en cumul
      const subs = values.sub_thematics || [];
      for (const st of subs) {
        let sub_thematic_id = await findExistingSubThematicIdByTitle(
          thematic_id,
          st.title
        );

        if (!sub_thematic_id) {
          const stRes = await subThematicServices.create({
            thematic_id,
            title: st.title,
            description: st.description || null,
            difficulty_level: st.difficulty_level || 'moyen',
            display_order: st.display_order ?? 0,
          });
          sub_thematic_id =
            stRes?.sub_thematic_id ??
            stRes?.data?.sub_thematic_id ??
            stRes?.data?.data?.sub_thematic_id;
          if (!sub_thematic_id) throw new Error('sub_thematic_id introuvable');
        }

        // 3) Ajouter les questions (cumul)
        const questions = st.questions || [];
        for (const q of questions) {
          await questionServices.create({
            sub_thematic_id,
            content: q.content,
            explanation: q.explanation || null,
            difficulty_level: q.difficulty_level || 'moyen',
            question_type: q.question_type || 'multiple_choice',
            points: q.points ?? 10,
            time_limit: q.time_limit ?? 30,
            allow_multiple_correct: q.allow_multiple_correct ? 1 : 0,
            media_url: q.media_url || null,

            // Réponses (3 options)
            answer_option1: q.answer_option1,
            answer_option2: q.answer_option2,
            answer_option3: q.answer_option3,
            correct_option: q.correct_option,
            answer_type: q.answer_type || 'text',
            answer_media_url: q.answer_media_url || null,
            points_value: q.points_value ?? 1,
          });
        }
      }

      message.success('Cumul effectué: thématique/sous-thématiques existantes utilisées, questions ajoutées');

      // Génération du fichier Excel à partir du formulaire soumis
      exportToExcel(values);

      form.resetFields();
      setFileList([]);
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.error || e.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  // Normalisation des clés Excel
  const normalizeKey = (s) =>
    s
      ? s
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
      : '';

  const pick = (obj, candidates) => {
    for (const c of candidates) {
      const v = obj[c];
      if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return undefined;
  };

  // Import Excel
  const handleExcelImport = async (file) => {
    setExcelLoading(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

      if (!rows || rows.length === 0) throw new Error('Fichier Excel vide ou invalide');

      const toNorm = (row) => {
        const n = {};
        Object.keys(row).forEach((k) => {
          n[normalizeKey(k)] = row[k];
        });
        return n;
      };

      const getThematicTitle = (n) =>
        pick(n, [
          'thematic_title',
          'thematique',
          'thematique_title',
          'thematic',
          'titre',
          'titre_thematique',
        ]);

      const thematicsMap = new Map();
      let lastThematicKey = null;
      const lastSubKeyByThematic = new Map();
      rows.forEach((r, idx) => {
        const n = toNorm(r);

        const tTitle = getThematicTitle(n);
        const tKey = tTitle ? normalizeTitleStrict(tTitle) : lastThematicKey;
        if (!tKey) return;
        const tDesc = pick(n, [
          'thematic_description',
          'description_thematique',
          'description',
        ]);
        const tColor = pick(n, ['color_code', 'couleur']) || '#6366f1';
        const tOrder = Number(pick(n, ['display_order', 'ordre_thematique']) ?? 0);

        if (!thematicsMap.has(tKey)) {
          if (!tTitle) return;
          thematicsMap.set(tKey, {
            title: tTitle,
            description: tDesc || '',
            color_code: tColor,
            display_order: tOrder,
            sub_thematics: new Map(),
          });
        } else {
          const existing = thematicsMap.get(tKey);
          if (!existing.description && tDesc) existing.description = tDesc;
          if (!existing.color_code && tColor) existing.color_code = tColor;
          if (!existing.display_order && Number.isFinite(tOrder)) existing.display_order = tOrder;
        }

        lastThematicKey = tKey;

        const stTitle = pick(n, [
          'sub_title',
          'sous_thematique',
          'sousthematique',
          'sous__thematique',
          'sous_thematiques',
        ]);
        const stKey = stTitle ? normalizeTitleStrict(stTitle) : lastSubKeyByThematic.get(tKey);
        if (!stKey) return;
        const stDesc = pick(n, ['sub_description', 'description_sous_thematique']);
        const stDiff = normalizeDifficultyLevel(pick(n, ['difficulty', 'difficulte']));
        const stOrder = Number(pick(n, ['sub_display_order', 'ordre_sous_thematique']) ?? 0);

        const thematic = thematicsMap.get(tKey);
        if (!thematic.sub_thematics.has(stKey)) {
          if (!stTitle) return;
          thematic.sub_thematics.set(stKey, {
            title: stTitle,
            description: stDesc || null,
            difficulty_level: stDiff,
            display_order: stOrder,
            questions: [],
          });
        } else if (stTitle) {
          const existingSt = thematic.sub_thematics.get(stKey);
          if (!existingSt.title) existingSt.title = stTitle;
          if (!existingSt.description && stDesc) existingSt.description = stDesc;
          if (!existingSt.display_order && Number.isFinite(stOrder)) existingSt.display_order = stOrder;
          if (!existingSt.difficulty_level && stDiff) existingSt.difficulty_level = stDiff;
        }

        lastSubKeyByThematic.set(tKey, stKey);

        // Normalisation de la bonne option
        const correctOptionRaw = pick(n, ['correct_option', 'bonne_option']);
        let correct_option = Number(correctOptionRaw);
        if (![1, 2, 3].includes(correct_option)) {
          const coStr = String(correctOptionRaw || '').trim().toLowerCase();
          if (coStr.includes('1')) correct_option = 1;
          else if (coStr.includes('2')) correct_option = 2;
          else if (coStr.includes('3')) correct_option = 3;
          else correct_option = 1;
        }

        const q = {
          content: pick(n, ['question']) || '',
          explanation: pick(n, ['explanation', 'explication']) || null,
          difficulty_level: stDiff,
          question_type: normalizeQuestionType(pick(n, ['question_type', 'type'])),
          points: Number(pick(n, ['points']) ?? 10),
          time_limit: Number(pick(n, ['time_limit', 'temps']) ?? 30),
          media_url: pick(n, ['media_url', 'media']) || null,
          allow_multiple_correct: 0,
          answer_option1: pick(n, ['answer_option1', 'reponse_1', 'reponse1']) || '',
          answer_option2: pick(n, ['answer_option2', 'reponse_2', 'reponse2']) || '',
          answer_option3: pick(n, ['answer_option3', 'reponse_3', 'reponse3']) || '',
          correct_option,
          answer_type: normalizeAnswerType(pick(n, ['answer_type', 'type_de_reponse'])) || 'text',
          answer_media_url: pick(n, ['answer_media_url', 'media_reponse_url', 'media_reponse__url']) || null,
          points_value: Number(pick(n, ['points_value', 'points_bonne_reponse']) ?? 1),
        };

        // Validation minimale
        if (!q.content || !q.answer_option1 || !q.answer_option2 || !q.answer_option3) {
          console.warn(`Ligne ${idx + 2}: question/réponses incomplètes, ignorée.`);
          return;
        }

        thematic.sub_thematics.get(stKey).questions.push(q);
      });

      const thematics = Array.from(thematicsMap.values()).map((t) => ({
        ...t,
        sub_thematics: Array.from(t.sub_thematics.values()),
      }));

      if (thematics.length === 0) throw new Error('Colonne thématique manquante');

      if (thematics.length === 1) {
        const only = thematics[0];
        if (only.sub_thematics.length === 0) {
          message.warning("Aucune sous‑thématique détectée: vérifiez l'en‑tête 'Sous‑thématique'.");
        }
        form.setFieldsValue({
          title: only.title,
          description: only.description || '',
          color_code: only.color_code,
          display_order: only.display_order,
          sub_thematics: only.sub_thematics,
        });

        const totalQuestions = only.sub_thematics.reduce(
          (a, b) => a + (b.questions?.length || 0),
          0,
        );
        message.success(`Import réussi: ${only.sub_thematics.length} sous‑thématiques, ${totalQuestions} questions`);
        return false;
      }

      const errors = [];
      thematics.forEach((t) => {
        const errs = validateQuiz({ title: t.title, sub_thematics: t.sub_thematics });
        errs.forEach((e) => errors.push(`[${t.title}] ${e}`));
      });
      if (errors.length) {
        setErrorMessages(errors);
        setErrorModalOpen(true);
        return false;
      }

      for (const t of thematics) {
        let thematic_id = await findExistingThematicIdByTitle(t.title);
        if (!thematic_id) {
          const formData = new FormData();
          formData.append('title', t.title);
          formData.append('description', t.description || '');
          formData.append('color_code', t.color_code || '#6366f1');
          formData.append('display_order', t.display_order ?? 0);
          const tRes = await thematicService.createThematic(formData);
          thematic_id =
            tRes?.thematic_id ?? tRes?.data?.thematic_id ?? tRes?.data?.data?.thematic_id;
          if (!thematic_id) throw new Error('thematic_id introuvable');
        }

        for (const st of t.sub_thematics) {
          let sub_thematic_id = await findExistingSubThematicIdByTitle(
            thematic_id,
            st.title
          );
          if (!sub_thematic_id) {
            const stRes = await subThematicServices.create({
              thematic_id,
              title: st.title,
              description: st.description || null,
              difficulty_level: st.difficulty_level || 'moyen',
              display_order: st.display_order ?? 0,
            });
            sub_thematic_id =
              stRes?.sub_thematic_id ??
              stRes?.data?.sub_thematic_id ??
              stRes?.data?.data?.sub_thematic_id;
            if (!sub_thematic_id) throw new Error('sub_thematic_id introuvable');
          }

          const questions = st.questions || [];
          for (const q of questions) {
            await questionServices.create({
              sub_thematic_id,
              content: q.content,
              explanation: q.explanation || null,
              difficulty_level: q.difficulty_level || 'moyen',
              question_type: q.question_type || 'multiple_choice',
              points: q.points ?? 10,
              time_limit: q.time_limit ?? 30,
              allow_multiple_correct: q.allow_multiple_correct ? 1 : 0,
              media_url: q.media_url || null,
              answer_option1: q.answer_option1,
              answer_option2: q.answer_option2,
              answer_option3: q.answer_option3,
              correct_option: q.correct_option,
              answer_type: q.answer_type || 'text',
              answer_media_url: q.answer_media_url || null,
              points_value: q.points_value ?? 1,
            });
          }
        }
      }

      const totalSubs = thematics.reduce((a, b) => a + b.sub_thematics.length, 0);
      const totalQuestions = thematics.reduce(
        (a, b) => a + b.sub_thematics.reduce((x, y) => x + (y.questions?.length || 0), 0),
        0,
      );
      message.success(`Import réussi: ${thematics.length} thématiques, ${totalSubs} sous‑thématiques, ${totalQuestions} questions`);
    } catch (e) {
      console.error(e);
      message.error(e.message || "Erreur lors de l'import Excel");
    } finally {
      setExcelLoading(false);
    }
    return false;
  };

  return (
    <>
      <Modal
        open={errorModalOpen}
        title="Erreurs de validation"
        onCancel={handleCloseErrorModal}
        footer={
          <Button type="primary" onClick={handleCloseErrorModal}>
            OK
          </Button>
        }
      >
        <ul style={{ marginLeft: 16 }}>
          {errorMessages.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </Modal>

      <Card>
        <Form form={form} onFinish={onFinish} layout="vertical">
          {/* Import / Export Excel */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Importer via Excel</h3>
              <div className="d-flex flex-wrap gap-2">
              {/* Bouton d'import */}
              <Upload
                beforeUpload={handleExcelImport}
                showUploadList={false}
                accept=".xlsx,.xls"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} loading={excelLoading}>
                  Importer Excel (XLSX)
                </Button>
              </Upload>

              {/* Bouton d'export séparé */}
              <Button
                icon={<UploadOutlined />}
                loading={excelLoading}
                onClick={downloadExampleExcel}
              >
                Exporter un exemple (XLSX)
              </Button>
            </div>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              Schéma attendu: Thématique, Description thématique, Couleur, Ordre thématique, Sous‑thématique,
              Description sous‑thématique, Difficulté, Ordre sous‑thématique, Question, Explication, Type,
              Points, Temps, Media (URL), Réponse 1, Réponse 2, Réponse 3, Bonne option (1‑3), Type de réponse,
              Media réponse (URL), Points bonne réponse.
            </p>
          </div>

          {/* Thématique */}
          <h3>Thématique</h3>
          <Form.Item name="title" label="Titre" rules={[{ required: true, message: 'Titre requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space wrap>
            <Form.Item name="color_code" label="Couleur (hex)">
              <Input placeholder="#6366f1" style={{ width: 200, maxWidth: '100%' }} />
            </Form.Item>
            <Form.Item name="display_order" label="Ordre d'affichage">
              <InputNumber min={0} style={{ width: 160, maxWidth: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label="Icône">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Choisir une icône</Button>
            </Upload>
          </Form.Item>

          {/* Sous-thématiques */}
          <h3 style={{ marginTop: 16 }}>Sous-thématiques</h3>
          <Form.List name="sub_thematics">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small"
                    style={{ marginBottom: 12 }}
                    title={`Sous-thématique #${name + 1}`}
                    extra={
                      <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />}>
                        Supprimer
                      </Button>
                    }
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'title']}
                      label="Titre"
                      rules={[{ required: true, message: 'Titre requis' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']} label="Description">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Space wrap>
                      <Form.Item
                        {...restField}
                        name={[name, 'difficulty_level']}
                        label="Difficulté"
                        rules={[{ required: true }]}
                      >
                        <Radio.Group>
                          <Radio value="facile">Facile</Radio>
                          <Radio value="moyen">Moyen</Radio>
                          <Radio value="difficile">Difficile</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'display_order']} label="Ordre">
                        <InputNumber min={0} style={{ width: 120, maxWidth: '100%' }} />
                      </Form.Item>
                    </Space>

                    {/* Questions */}
                    <h4 style={{ marginTop: 8 }}>Questions</h4>
                    <Form.List name={[name, 'questions']}>
                      {(qFields, { add: addQ, remove: removeQ }) => (
                        <>
                          {qFields.map(({ key: qKey, name: qName, ...qRest }) => (
                            <Card
                              key={qKey}
                              size="small"
                              style={{ marginBottom: 8 }}
                              title={`Question #${qName + 1}`}
                              extra={
                                <Button
                                  danger
                                  onClick={() => removeQ(qName)}
                                  icon={<DeleteOutlined />}
                                >
                                  Supprimer
                                </Button>
                              }
                            >
                              <Form.Item
                                {...qRest}
                                name={[qName, 'content']}
                                label="Intitulé"
                                rules={[{ required: true }]}
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item {...qRest} name={[qName, 'explanation']} label="Explication">
                                <Input.TextArea rows={2} />
                              </Form.Item>
                              <Space wrap>
                                <Form.Item
                                  {...qRest}
                                  name={[qName, 'difficulty_level']}
                                  label="Difficulté"
                                  rules={[{ required: true }]}
                                >
                                  <Radio.Group>
                                    <Radio value="facile">Facile</Radio>
                                    <Radio value="moyen">Moyen</Radio>
                                    <Radio value="difficile">Difficile</Radio>
                                  </Radio.Group>
                                </Form.Item>

                                <Form.Item
                                  {...qRest}
                                  name={[qName, 'question_type']}
                                  label="Type"
                                  rules={[{ required: true }]}
                                >
                                  <Radio.Group>
                                    <Radio value="multiple_choice">Choix multiple</Radio>
                                    <Radio value="single_choice">Choix unique</Radio>
                                    <Radio value="true_false">Vrai/Faux</Radio>
                                    <Radio value="fill_in_blank">Texte libre</Radio>
                                  </Radio.Group>
                                </Form.Item>

                                <Form.Item {...qRest} name={[qName, 'points']} label="Points">
                                  <InputNumber min={0} style={{ width: 120 }} />
                                </Form.Item>
                                <Form.Item {...qRest} name={[qName, 'time_limit']} label="Temps (s)">
                                  <InputNumber
                                    min={0}
                                    parser={(v) => Math.max(0, Number(v || 0))}
                                    placeholder="Temps (s)"
                                    style={{ width: 120 }}
                                  />
                                </Form.Item>
                                <Form.Item {...qRest} name={[qName, 'media_url']} label="Media (URL)">
                                  <Input placeholder="https://..." style={{ width: 240, maxWidth: '100%' }} />
                                </Form.Item>
                              </Space>

                              <h5>Réponses (3 options)</h5>
                              <Form.Item
                                {...qRest}
                                name={[qName, 'answer_option1']}
                                label="Option 1"
                                rules={[{ required: true }]}
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                              <Form.Item
                                {...qRest}
                                name={[qName, 'answer_option2']}
                                label="Option 2"
                                rules={[{ required: true }]}
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                              <Form.Item
                                {...qRest}
                                name={[qName, 'answer_option3']}
                                label="Option 3"
                                rules={[{ required: true }]}
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                              <Space wrap>
                                <Form.Item
                                  {...qRest}
                                  name={[qName, 'correct_option']}
                                  label="Bonne option"
                                  rules={[{ required: true }]}
                                >
                                  <Radio.Group>
                                    <Radio value={1}>Option 1</Radio>
                                    <Radio value={2}>Option 2</Radio>
                                    <Radio value={3}>Option 3</Radio>
                                  </Radio.Group>
                                </Form.Item>
                                <Form.Item
                                  {...qRest}
                                  name={[qName, 'answer_type']}
                                  label="Type de réponse"
                                  rules={[{ required: true }]}
                                >
                                  <Radio.Group>
                                    <Radio value="text">Texte</Radio>
                                    <Radio value="image">Image</Radio>
                                    <Radio value="audio">Audio</Radio>
                                    <Radio value="video">Vidéo</Radio>
                                  </Radio.Group>
                                </Form.Item>
                                <Form.Item
                                  {...qRest}
                                  name={[qName, 'answer_media_url']}
                                  label="Media réponse (URL)"
                                >
                                  <Input placeholder="https://..." style={{ width: 240, maxWidth: '100%' }} />
                                </Form.Item>
                                <Form.Item
                                  {...qRest}
                                  name={[qName, 'points_value']}
                                  label="Points bonne réponse"
                                >
                                  <InputNumber min={0} style={{ width: 160, maxWidth: '100%' }} />
                                </Form.Item>
                              </Space>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => addQ()} icon={<PlusOutlined />}>
                            Ajouter une question
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Ajouter une sous-thématique
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Créer le quiz
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}

export default QuizCreate;


function normalizeAnswerType(valRaw) {
  const v = String(valRaw || '').trim().toLowerCase();
  const map = {
    texte: 'text',
    'texte libre': 'text',
    text: 'text',
    image: 'image',
    audio: 'audio',
    video: 'video',
    'vidéo': 'video',
  };
  return map[v] || 'text';
}
