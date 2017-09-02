import AWS from 'aws-sdk';
import { awsConfig } from '../../config';

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

export default docClient;
