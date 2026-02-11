import React, { useEffect, useState } from 'react';
import { Card, Table, Modal, Form, Input, Button, message, Radio, Grid } from 'antd';
import cguServices from '../../../../../configurations/Services/cguServices.js';
import privacyPolicyServices from '../../../../../configurations/Services/privacyPolicyServices.js';
import cookiesPolicyServices from '../../../../../configurations/Services/cookiesPolicyServices.js';
import aboutServices from '../../../../../configurations/Services/aboutServices.js';
import contactServices from '../../../../../configurations/Services/contactServices.js';
import faqServices from '../../../../../configurations/Services/faqService.js';

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
];

function Legal() {
  const [loading, setLoading] = useState(true);
  const [cgu, setCgu] = useState([]);
  const [privacy, setPrivacy] = useState([]);
  const [cookies, setCookies] = useState([]);
  const [about, setAbout] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [faq, setFaq] = useState([]);

  const [modal, setModal] = useState({ type: null, item: null });
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const tableSize = isMobile ? 'small' : 'middle';
  const tableScroll = { x: 'max-content' };
  const modalWidth = isMobile ? 'calc(100vw - 24px)' : 700;

  // === Chargement des données ===
  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, p, k, a, ct, f] = await Promise.all([
        cguServices.getAll(),
        privacyPolicyServices.getAll(),
        cookiesPolicyServices.getAll(),
        aboutServices.getAll(),
        contactServices.getAll().catch(() => []),
        faqServices.getAllFaq().catch(() => []),
      ]);
      setContacts(ct); // Afficher tous les contacts dans le dash, même "cachés"
      setCgu(c);
      setPrivacy(p);
      setCookies(k);
      setAbout(a);
      setFaq(f);
    } catch (e) {
      console.error(e);
      message.error('Erreur de chargement des données légales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // === Modal ===
  const openModal = (type, item = null) => {
    setModal({ type, item });
    setTimeout(() => {
      if (item) {
        form.setFieldsValue(item);
      } else {
        form.resetFields();
        if (type.includes('contact')) {
          form.setFieldsValue({ status: 'operationnel' });
        } else if (type.includes('faq')) {
          form.setFieldsValue({ is_active: 1 });
        } else if (!type.includes('about')) {
          form.setFieldsValue({ status: 'draft' });
        }
      }
    }, 0);
  };

  const closeModal = () => {
    setModal({ type: null, item: null });
    form.resetFields();
  };

  // === Sauvegarde ===
  const saveItem = async () => {
    try {
      const v = await form.validateFields();
      switch (modal.type) {
        case 'cgu-create':
          await cguServices.create(v);
          break;
        case 'cgu-edit':
          await cguServices.update(modal.item.id, v);
          break;
        case 'privacy-create':
          await privacyPolicyServices.create(v);
          break;
        case 'privacy-edit':
          await privacyPolicyServices.update(modal.item.id, v);
          break;
        case 'cookies-create':
          await cookiesPolicyServices.create(v);
          break;
        case 'cookies-edit':
          await cookiesPolicyServices.update(modal.item.id, v);
          break;
        case 'about-create':
          await aboutServices.create(v);
          break;
        case 'about-edit':
          await aboutServices.update(modal.item.id, v);
          break;
        case 'contact-create':
          await contactServices.create(v);
          break;
        case 'contact-edit':
          await contactServices.update(modal.item.id, v);
          break;
        case 'faq-create':
          await faqServices.createFaq({
            question: v.question,
            answer: v.answer,
            is_active: Number(v.is_active ?? 1),
          });
          break;
        case 'faq-edit':
          await faqServices.updateFaq(modal.item.faq_id, {
            question: v.question,
            answer: v.answer,
            is_active: Number(v.is_active),
          });
          break;
        default:
          break;
      }
      message.success('Enregistré avec succès');
      closeModal();
      await loadAll();
    } catch (e) {
      console.error(e);
      message.error('Erreur lors de l’enregistrement');
    }
  };

  // === Suppression ===
  const deleteItem = async (type, id) => {
    Modal.confirm({
      title: 'Supprimer cet élément ?',
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          if (type === 'cgu') await cguServices.delete(id);
          if (type === 'privacy') await privacyPolicyServices.delete(id);
          if (type === 'cookies') await cookiesPolicyServices.delete(id);
          if (type === 'about') await aboutServices.delete(id);
          if (type === 'contact') await contactServices.delete(id);
          if (type === 'faq') await faqServices.deleteFaq(id);
          message.success('Supprimé');
          await loadAll();
        } catch {
          message.error('Erreur lors de la suppression');
        }
      },
    });
  };

  // === Mise à jour du statut des contacts ===
  const updateContactStatus = async (item, status) => {
    try {
      await contactServices.update(item.id, { ...item, status });
      message.success('Statut du contact mis à jour');
      await loadAll();
    } catch {
      message.error('Erreur mise à jour contact');
    }
  };

  // === Colonnes communes ===
  const columnsCommon = (type) => [
    { title: 'Titre', dataIndex: 'title', key: 'title' },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const opt = statusOptions.find((s) => s.value === status);
        return opt ? opt.label : status || 'N/A';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button
            size="small"
            onClick={() => openModal(`${type}-edit`, r)}
          >
            Éditer
          </Button>
          <Button danger size="small" onClick={() => deleteItem(type, r.id)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  // === Colonnes "À propos" ===
  const aboutColumns = [
    { title: 'Titre', dataIndex: 'title', key: 'title' },
    { title: 'Sous-titre', dataIndex: 'subtitle', key: 'subtitle' },
    { title: 'Email', dataIndex: 'contact_email', key: 'contact_email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button
            size="small"
            onClick={() => openModal('about-edit', r)}
          >
            Éditer
          </Button>
          <Button danger size="small" onClick={() => deleteItem('about', r.id)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  // === Colonnes "Contacts" ===
  const contactColumns = [
    { title: 'Service', dataIndex: 'service', key: 'service' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Contenu',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (text?.length > 100 ? `${text.slice(0, 100)}…` : text || ''),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status, r) => (
        <Radio.Group
          value={status}
          onChange={(e) => updateContactStatus(r, e.target.value)}
          size="small"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        >
          <Radio.Button value="operationnel">Opérationnel</Radio.Button>
          <Radio.Button value="cacher">Caché</Radio.Button>
        </Radio.Group>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button
            size="small"
            onClick={() => openModal('contact-edit', r)}
          >
            Éditer
          </Button>
          <Button danger size="small" onClick={() => deleteItem('contact', r.id)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  // === Colonnes FAQ ===
  const faqColumns = [
    { title: 'Question', dataIndex: 'question', key: 'question' },
    { title: 'Réponse', dataIndex: 'answer', key: 'answer', width: 400 },
    {
      title: 'Statut',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active, r) => (
        <Radio.Group
          value={Number(is_active)}
          onChange={(e) => updateFaqStatus(r, e.target.value)}
          size="small"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        >
          <Radio.Button value={1}>Actif</Radio.Button>
          <Radio.Button value={0}>Inactif</Radio.Button>
        </Radio.Group>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button size="small" onClick={() => openModal('faq-edit', r)}>
            Éditer
          </Button>
          <Button danger size="small" onClick={() => deleteItem('faq', r.faq_id)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  const updateFaqStatus = async (item, is_active) => {
    try {
      await faqServices.updateFaq(item.faq_id, { is_active: Number(is_active) });
      message.success('Statut FAQ mis à jour');
      await loadAll();
    } catch {
      message.error('Erreur mise à jour FAQ');
    }
  };

  return (
    <div className="p-2 p-sm-3">
      <Card
        title="CGU"
        extra={<Button onClick={() => openModal('cgu-create')}>Ajouter</Button>}
        loading={loading}
      >
        <Table
          dataSource={cgu}
          columns={columnsCommon('cgu')}
          rowKey="id"
          pagination={false}
          size={tableSize}
          scroll={tableScroll}
        />
      </Card>

      <Card
        title="Politique de confidentialité"
        className="mt-3"
        extra={<Button onClick={() => openModal('privacy-create')}>Ajouter</Button>}
        loading={loading}
      >
        <Table
          dataSource={privacy}
          columns={columnsCommon('privacy')}
          rowKey="id"
          pagination={false}
          size={tableSize}
          scroll={tableScroll}
        />
      </Card>

      <Card
        title="Politique des cookies"
        className="mt-3"
        extra={<Button onClick={() => openModal('cookies-create')}>Ajouter</Button>}
        loading={loading}
      >
        <Table
          dataSource={cookies}
          columns={columnsCommon('cookies')}
          rowKey="id"
          pagination={false}
          size={tableSize}
          scroll={tableScroll}
        />
      </Card>

      <Card
        title="À propos"
        className="mt-3"
        extra={<Button onClick={() => openModal('about-create')}>Ajouter</Button>}
        loading={loading}
      >
        <Table
          dataSource={about}
          columns={aboutColumns}
          rowKey="id"
          pagination={false}
          size={tableSize}
          scroll={tableScroll}
        />
      </Card>

      <Card
        title="Contacts"
        className="mt-3"
        loading={loading}
        extra={<Button onClick={() => openModal('contact-create')}>Ajouter</Button>}
      >
        <Table
          dataSource={contacts}
          columns={contactColumns}
          rowKey="id"
          pagination={false}
          size={tableSize}
          scroll={tableScroll}
        />
      </Card>

      <Card
        title="FAQ"
        className="mt-3"
        loading={loading}
        extra={<Button onClick={() => openModal('faq-create')}>Ajouter</Button>}
      >
        <Table
          dataSource={faq}
          columns={faqColumns}
          rowKey="faq_id"
          pagination={false}
          size={tableSize}
          scroll={tableScroll}
        />
      </Card>

      {/* MODAL UNIQUE */}
      <Modal
        title={
          modal.type?.includes('cgu')
            ? modal.type.endsWith('create')
              ? 'Créer CGU'
              : 'Éditer CGU'
            : modal.type?.includes('privacy')
              ? modal.type.endsWith('create')
                ? 'Créer Politique de confidentialité'
                : 'Éditer Politique de confidentialité'
              : modal.type?.includes('cookies')
                ? modal.type.endsWith('create')
                  ? 'Créer Politique des cookies'
                  : 'Éditer Politique des cookies'
                : modal.type?.includes('about')
                  ? modal.type.endsWith('create')
                    ? 'Créer À propos'
                    : 'Éditer À propos'
                  : modal.type?.includes('contact')
                    ? modal.type.endsWith('create')
                      ? 'Créer Contact'
                      : 'Éditer Contact'
                    : modal.type?.includes('faq')
                      ? modal.type.endsWith('create')
                        ? 'Créer FAQ'
                        : 'Éditer FAQ'
                      : ''
        }
        open={!!modal.type}
        onCancel={closeModal}
        onOk={saveItem}
        okText="Enregistrer"
        cancelText="Annuler"
        width={modalWidth}
        style={isMobile ? { top: 12 } : undefined}
      >
        <Form form={form} layout="vertical">
          {/* ABOUT */}
          {modal.type?.includes('about') && (
            <>
              <Form.Item name="title" label="Titre" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="subtitle" label="Sous-titre">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="mission" label="Mission">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="vision" label="Vision">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="contact_email" label="Email de contact">
                <Input />
              </Form.Item>
            </>
          )}

          {/* CONTACT */}
          {modal.type?.includes('contact') && (
            <>
              <Form.Item name="service" label="Service" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="content" label="Description" rules={[{ required: true }]}>
                <Input.TextArea rows={6} />
              </Form.Item>
              <Form.Item name="status" label="Statut">
                <Radio.Group>
                  <Radio value="operationnel">Opérationnel</Radio>
                  <Radio value="cacher">Caché</Radio>
                </Radio.Group>
              </Form.Item>
            </>
          )}

          {/* FAQ */}
          {modal.type?.includes('faq') && (
            <>
              <Form.Item name="question" label="Question" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="answer" label="Réponse" rules={[{ required: true }]}>
                <Input.TextArea rows={6} />
              </Form.Item>
              <Form.Item name="is_active" label="Statut">
                <Radio.Group>
                  <Radio value={1}>Actif</Radio>
                  <Radio value={0}>Inactif</Radio>
                </Radio.Group>
              </Form.Item>
            </>
          )}

          {/* CGU / PRIVACY / COOKIES */}
          {!modal.type?.includes('about') &&
            !modal.type?.includes('contact') &&
            !modal.type?.includes('faq') && (
              <>
                <Form.Item name="title" label="Titre" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="content" label="Contenu" rules={[{ required: true }]}>
                  <Input.TextArea rows={6} />
                </Form.Item>
                <Form.Item name="status" label="Statut">
                  <Radio.Group>
                    <Radio value="draft">Brouillon</Radio>
                    <Radio value="published">Publié</Radio>
                  </Radio.Group>
                </Form.Item>
              </>
            )}
        </Form>
      </Modal>
    </div>
  );
}

export default Legal;
