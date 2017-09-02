import userDB from './userDB';

const file = 'server/libs/userMiddleware.js';

export default async (req) => {
  const uid = req.session.uid;

  req.log.info({ file, function: 'default', url: req.url, uid });

  if (!uid) return null;

  try {
    const user = await userDB.findUser(req.log, uid);
    req.user = user;
    req.log.info({ file, function: 'default', user });
    return null;
  } catch(err) {
    req.log.error({ file, function: 'default', err });
    return null;
  }
};
