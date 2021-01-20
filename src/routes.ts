import { json, Router } from 'express';
import sha512 from 'crypto-js/sha512';
import { User } from './entity/User';
import { validateField } from './utils/validateField';
import { sendRefreshToken } from './sendRefreshToken';
import { createAccessToken, createRefreshToken } from './createToken';
import { verify } from 'jsonwebtoken';
import { Token } from './entity/Token';

export const router = Router();

router.get('/', (_, res) => res.send('Hello'));

router.post('/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = sha512(password).toString();
  let err: string | null = null;

  if ((err = validateField('email', email))) {
    return res.json({
      error: err,
    });
  }

  if ((err = validateField('password', password))) {
    return res.json({
      error: err,
    });
  }

  try {
    await User.insert({
      email,
      password: hashedPassword,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      error: err.message,
    });
  }

  return res.json({
    error: null,
  });
});

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    return res.json({
      accessToken: null,
      user: null,
    });
  }

  const valid = user.password === sha512(password).toString();

  if (!valid) {
    return res.json({
      accessToken: null,
      user: null,
    });
  }

  // login success
  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(accessToken);
  sendRefreshToken(res, refreshToken);

  await Token.insert({
    refreshToken,
    accessToken,
    user: user,
  });

  return res.json({
    accessToken,
    user: {
      email: user.email,
    },
  });
});

router.get('/me', async (req, res) => {
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.json({
      user: null,
    });
  }

  try {
    // auth token: Bearer token......
    const token = authorization.split(' ')[1];
    const payload: any = verify(token, process.env.ACCESS_SECRET!);
    const user = await User.findOne(payload.userId);

    if (!user) {
      return res.json({
        user: null,
      });
    }

    return res.json({
      user: {
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.json({
      user: null,
    });
  }
});

router.get('/refresh_token', async (req, res) => {
  // check if there is a refresh and access token
  const refreshToken = req.cookies.gid;
  const authorization = req.headers['authorization'];

  if (!refreshToken || !authorization) {
    return res.json({
      accessToken: null,
    });
  }

  // auth token: Bearer token......
  const accessToken = authorization.split(' ')[1];

  // get refreshToken from db
  const tokenInDb = await Token.findOne({
    where: {
      refreshToken,
    },
  });

  if (!tokenInDb) {
    return res.json({
      accessToken: null,
    });
  }

  // check if user still exists
  const user = await User.findOne(tokenInDb.user);

  if (!user) {
    return res.json({
      accessToken: null,
    });
  }

  // check if accessToken than binded to refreshToken equals accessToken from client
  if (tokenInDb.accessToken !== accessToken) {
    return res.json({
      accessToken: null,
    });
  }

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = await createRefreshToken(newAccessToken);
  sendRefreshToken(res, newRefreshToken);

  // update tokens in db
  await Token.update(tokenInDb, {
    refreshToken: newRefreshToken,
    accessToken: newAccessToken,
  });

  return res.json({
    accessToken: newAccessToken,
  });
});

router.post('/logout', async (req, res) => {
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.json({
      error: null,
    });
  }

  let token;
  try {
    // auth token: Bearer token......
    token = authorization.split(' ')[1];
    const payload: any = verify(token, process.env.ACCESS_SECRET!);
    const user = await User.findOne(payload.userId);

    if (!user) {
      return res.json({
        error: null,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      error: null,
    });
  }

  sendRefreshToken(res, '');

  if (!token) {
    return res.json({
      error: null,
    });
  }

  const tokenToDelete = await Token.find({
    where: {
      accessToken: token,
    },
  });
  await Token.remove(tokenToDelete);

  return res.json({
    error: null,
  });
});

router.post('/end_all_sessions', async (req, res) => {
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.json({
      error: 'not authorized',
    });
  }

  try {
    // auth token: Bearer token......
    const token = authorization.split(' ')[1];
    const payload: any = verify(token, process.env.ACCESS_SECRET!);
    const user = await User.findOne(payload.userId);

    if (!user) {
      return res.json({
        error: 'no user',
      });
    }

    const tokens = await Token.find({
      where: {
        user,
      },
    });

    await Token.remove(tokens);

    return res.json({
      error: null,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      error: err.message,
    });
  }
});
