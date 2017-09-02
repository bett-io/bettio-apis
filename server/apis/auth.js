import facebook from '../libs/facebook';
import session from '../libs/session';
import userDB from '../libs/userDB';

const file = 'server/apis/auth.js';

const findOrCreateUser = async (logger, fbUserInfo) => {
  try {
    let user = await userDB.findUserByFbId(logger, fbUserInfo.id);

    if (!user) {
      user = await userDB.createUser(logger, fbUserInfo);
    }

    return user;
  } catch(err) {
    logger.info({ file, function: 'findOrCreateUser', err });
    throw err;
  }
};

const signin = async (req) => {
  const fbToken = req.body.fbToken;

  req.log.info({ file, function: 'signin', fbToken });

  if (!fbToken) {
    req.log.info({ file, function: 'signin', log: 'invalid fbToken' });
    throw new Error('invalid fbToken');
  }

  const fbUserInfo = await facebook.getUserInfo(req.log, fbToken);
  req.log.info({ file, function: 'signin', fbUserInfo });

  if (!fbUserInfo.id) {
    req.log.info({ file, function: 'signin', log: 'failed to fetch user info from facebook' });
    throw new Error('failed to fetch user information from facebook');
  }

  const user = await findOrCreateUser(req.log, fbUserInfo);
  req.log.info({ file, function: 'signin', user });

  const result = {
    uid: user.id,
    name: user.name,
    pictureUrl: user.pictureUrl,
    fbToken: req.body.fbToken,
  };

  session.update(req, {
    uid: user.id,
    fbToken: req.body.fbToken,
  });

  return result;
};

const signout = (req) => {
  session.update(req, {
    uid: null,
    fbToken: null,
  });

  return {};
};

module.exports = {
  signin,
  signout,
};
