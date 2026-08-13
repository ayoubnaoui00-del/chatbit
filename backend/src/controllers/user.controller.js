import db from '../config/database.js';

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, fullname, email, role, isonline, createdat FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMe,
};
