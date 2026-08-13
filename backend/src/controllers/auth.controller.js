import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const register = async (req, res, next) => {
  try {
    const { fullname, email, password, role = 'client' } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullname, email, and password are required fields',
      });
    }

    const normalizedRole = role.toLowerCase();
    if (!['client', 'agent'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'client' or 'agent'",
      });
    }

    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const saltRounds = 10;
    const passwordhash = await bcrypt.hash(password, saltRounds);

    const newUserResult = await db.query(
      `INSERT INTO users (fullname, email, passwordhash, role, isonline, createdat)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING id, fullname, email, role, isonline, createdat`,
      [fullname.trim(), email.toLowerCase().trim(), passwordhash, normalizedRole]
    );

    const user = newUserResult.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await db.query(
      'SELECT id, fullname, email, passwordhash, role, isonline, createdat FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.passwordhash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    delete user.passwordhash;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
};
