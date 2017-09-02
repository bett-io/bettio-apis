import AWS from 'aws-sdk';
import { awsConfig } from '../../config';
import shortid from 'shortid';

const file = 'server/libs/userDB.js';

let _docClient = null;

const docClient = () => {
  if (!_docClient) {
    AWS.config.update({
      region: awsConfig.common.region,
    });

    _docClient = new AWS.DynamoDB.DocumentClient();
  }

  return _docClient;
};

const createUser = (logger, fbUserInfo) => new Promise((resolve, reject) => {
  var params = {
    TableName: awsConfig.dynamodb.userTableName,
    Item: {
      id: shortid.generate(),
      name: fbUserInfo.name,
      fbid: fbUserInfo.id,
      pictureUrl: fbUserInfo.picture,
    },
  };

  docClient().put(params, function(err, data) {
    if (err) {
      logger.error({ file, function: 'userDB.createUser', params, err });
      return reject(err);
    }

    logger.info({ file, function: 'userDB.createUser', params, data });
    return resolve(data);
  });
});

const findFbIdIndex = (logger, fbId) => new Promise((resolve, reject) => {
  const params = {
    TableName : awsConfig.dynamodb.userTableName,
    IndexName: awsConfig.dynamodb.userIndexName,
    KeyConditionExpression: 'fbid = :fbid',
    ExpressionAttributeValues: {
      ':fbid': fbId,
    },
  };

  docClient().query(params, function(err, data) {
    if (err) {
      logger.error({ file, function: 'findFbIdIndex', params, err });
      return reject(err);
    }

    if (data.Count > 1) {
      logger.error({ file, function: 'findFbIdIndex',
        log: 'multiple user rows with the same fbid detected', params, data,
      });
    }

    logger.info({ file, function: 'findFbIdIndex', data, items: data.Items });

    return resolve(data.Items[0]);
  });
});

const findUserTable = (logger, id) => new Promise((resolve, reject) => {
  const params = {
    TableName: awsConfig.dynamodb.userTableName,
    Key: {
      id,
    },
  };

  logger.info({ file, function: 'findUserTable', params });

  docClient().get(params, function(err, data) {
    if (err) {
      logger.error({ file, function: 'findUserTable', params, err });
      return reject(err);
    }

    logger.info({ file, function: 'findUserTable', params, data });

    return resolve(data.Item);
  });
});

const findUser = async (logger, id) => {
  try {
    const user = await findUserTable(id);

    logger.info({ file, function: 'findUser', id, user });

    return user;
  } catch(err) {
    logger.error({ file, function: 'findUser', id, err });

    return null;
  }
};

const findUserByFbId = async (logger, fbId) => {
  try {
    const fbIdUser = await findFbIdIndex(logger, fbId);

    if (!fbIdUser || !fbIdUser.id) return null;

    const user = await findUserTable(logger, fbIdUser.id);

    logger.info({ file, function: 'findUserByFbId', fbId, user });

    return user;
  } catch(err) {
    logger.error({ file, function: 'findUserByFbId', fbId, err });

    return null;
  }
};

const userDB = {
  createUser,
  findUser,
  findUserByFbId,
};

export default userDB;
