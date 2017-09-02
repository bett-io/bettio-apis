import { awsConfig } from '../../config';
import connectDynamoDb from 'connect-dynamodb';
import session from 'express-session';

const file = 'server/libs/session.js';

const createSessionMiddleware = () => {
  const sessionOption = {
    resave: false,
    saveUninitialized: true,
    secret: 'session secret',
  };

  if (process.env.NODE_ENV === 'production') {
    // Use DynamoDB only in production. Session will be stored in memory in non-production.

    const dynamoDBOptions = {
      // Optional DynamoDB table name, defaults to 'sessions'
      table: awsConfig.dynamodb.sessionTableName,

      // Optional JSON object of AWS credentials and configuration
      AWSConfigJSON: {
        region: awsConfig.common.region,
      },

      // Optional ProvisionedThroughput params, defaults to 5
      readCapacityUnits: 2,
      writeCapacityUnits: 2,
    };

    const DynamoDBStore = connectDynamoDb({session});

    sessionOption.store = new DynamoDBStore(dynamoDBOptions);
  } else {
    console.log({ file, function: 'getSessionOption', log: 'session will be stored in memory' });
  }

  return session(sessionOption);
};

const update = (req, data) => {
  req.log.info({ file, function: 'update', data });

  req.session = Object.assign(req.session, data);
};

module.exports = {
  createSessionMiddleware,
  update,
};
