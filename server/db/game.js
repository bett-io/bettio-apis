import { awsConfig } from '../../config';
import docClient from './docClient';

const file = 'server/db/game.js';

const findGame = (logger, id) => new Promise((resolve, reject) => {
  const params = {
    TableName: awsConfig.dynamodb.gameTableName,
    Key: {
      id,
    },
  };

  logger.info({ file, function: 'findGame', params });

  docClient().get(params, function(err, data) {
    if (err) {
      logger.error({ file, function: 'findGame', params, err });
      return reject(err);
    }

    logger.info({ file, function: 'findGame', params, data });

    return resolve(data.Item);
  });
});

export {
  findGame,
};
