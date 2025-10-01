import db from '../config/db.js'; 

//====================================================
// FONCTIONS COMMENT - DONNÉES COMPLÈTES
// ====================================================

export const getAllComments = async () => {
        try {
            const [rows] = await db.query('SELECT * FROM funquiz_comments ');
            return rows;
        } catch (error) {
            throw error;
        }
    };

export const getCommentById = async (comment_id) => {
        try {
            const [rows] = await db.query('SELECT * FROM funquiz_comments WHERE comment_id = ?', [comment_id]);
            return rows[0] ? [rows[0]] : [];
        } catch (error) {
            throw error;
        }
    };

export const createComment = async (commentData) => {
        try {
            const { user_id, content, is_approved = 1 } = commentData; // destructuring + valeur par défaut

            const [result] = await db.query(
              `INSERT INTO funquiz_comments (user_id, content, is_approved) VALUES (?, ?, ?)`,
              [user_id, content, is_approved]
            );

            return { 
              comment_id: result.insertId, 
              user_id, 
              content, 
              is_approved
            };
        } catch (error) {
            throw error;
        }
    };

export const updateComment = async (comment_id, commentData) => {
        try {
            if (!comment_id) {
                throw new Error("comment_id requis.");
            }

            const { user_id, content, is_approved} = commentData;

            // Construire dynamiquement la requête SQL
            const fields = [];
            const values = [];

            if (user_id !== undefined) {
                fields.push("user_id = ?");
                values.push(user_id);
            }
            if (content !== undefined) {
                fields.push("content = ?");
                values.push(content);
            }
            if (rating !== undefined) {
                fields.push("is_approved = ?");
                values.push(is_approved);
            }
            if (fields.length === 0) {
                throw new Error("Aucun champ à mettre à jour.");
            }

            values.push(comment_id); // pour le WHERE

            const sql = `UPDATE funquiz_comments SET ${fields.join(", ")} WHERE comment_id = ?`;
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                throw new Error("Commentaire non trouvé.");
            }

            return { comment_id, ...commentData };
        } catch (error) {
            throw error;
        }
    };

export const deleteComment = async (comment_id) => {
        try {
            const [result] = await db.query('DELETE FROM funquiz_comments WHERE comment_id = ?', [comment_id]);
            if (result.affectedRows === 0) {
                throw new Error("Commentaire non trouvé.");
            }
            return { message: "Commentaire supprimé avec succès." };
        } catch (error) {
            throw error;
        }
    }


//====================================================
// FONCTIONS COMMENT - DONNÉES AVEC JOINTURES
// ====================================================

// Exemples de fonctions avec jointures, à adapter selon les besoins
export const getCommentsWithUserAndQuiz = async () => {
    try {
        const [rows] = await db.query(`
            SELECT c.comment_id, c.content, c.is_approved, c.created_at, c.updated_at,
                   u.user_id, u.first_name, u.name, u.email, u.avatar_url
            FROM funquiz_comments c
            JOIN funquiz_users u ON c.user_id = u.user_id
        `);
        return rows;
    } catch (error) {
        throw error;
    }
};  