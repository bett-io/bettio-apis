import userDB from './userDB';

const file = 'server/libs/userMiddleware.js';

export default async (req) => {
  const uid = req.session.uid;

  console.log({ file, function: 'default', url: req.url, uid });

  if (!uid) return null;

  try {
    const user = await userDB.findUser(uid);
    req.user = user;
    console.log({ file, function: 'default', user });
    return null;
  } catch(err) {
    console.error({ file, function: 'default', err });
    return null;
  }
};
