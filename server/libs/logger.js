import assert from 'assert';

export default (req, res, next) => {
  const basic = {
    rid: req.id,
    sid: req.sessionID,
    uid: req.session.uid,
  };

  const logFunc = (consoleFunc) => (log) => {
    assert(typeof log === 'object');
    if (log.rid || log.sid || log.uid) {
      console.warn({ warn: 'rid, sid and uid shouldn\'t be passed to log function.', log });
    }

    consoleFunc(Object.assign(basic, log));
  };

  req.log = {
    info: logFunc(console.log),
    error: logFunc(console.error),
  };

  next();
};
