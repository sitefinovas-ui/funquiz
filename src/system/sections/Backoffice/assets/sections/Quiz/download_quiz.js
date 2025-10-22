import * as XLSX from 'xlsx';
import { message } from 'antd';

let downloading = false; // verrou pour éviter le double téléchargement

export const downloadExampleExcel = (e) => {
  if (e) e.preventDefault();
  if (downloading) return; // si déjà en cours, on bloque
  downloading = true;

  try {
    const rows = [
      {
        'Thématique': 'Mathématiques',
        'Description thématique': 'Notions de base en maths',
        'Couleur': '#00bcd4',
        'Ordre thématique': 0,
        'Sous-thématique': 'Algèbre',
        'Description sous-thématique': 'Équations simples',
        'Difficulté': 'moyen',
        'Ordre sous-thématique': 0,
        'Question': 'Combien font 2 + 2 ?',
        'Explication': 'Addition basique',
        'Type': 'multiple_choice',
        'Points': 10,
        'Temps': 30,
        'Media (URL)': '',
        'Réponse 1': '3',
        'Réponse 2': '4',
        'Réponse 3': '5',
        'Bonne option': 2,
        'Type de réponse': 'text',
        'Media réponse (URL)': '',
        'Points bonne réponse': 1,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exemple');

    XLSX.writeFile(wb, 'quiz_example_template.xlsx');
    message.success('Modèle Excel téléchargé');
  } catch (err) {
    console.error(err);
    message.error('Impossible de générer le fichier exemple');
  } finally {
    setTimeout(() => {
      downloading = false;
    }, 1000);
  }
};