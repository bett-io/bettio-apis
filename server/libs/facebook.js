import axios from 'axios';

const getUserInfo = async (logger, fbToken) => {
  const urlMe = 'https://graph.facebook.com/me';

  try {
    const meRes = await axios.get(urlMe, {
      params: {
        access_token: fbToken,
      },
    });

    logger.info({ function: 'facebook.getUserInfo', meRes: meRes.data });

    const picUrl = 'https://graph.facebook.com/' + meRes.data.id + '/picture';
    const picRes = await axios.get(picUrl, {
      params: {
        redirect: false,
      },
    });

    logger.info({ function: 'facebook.getUserInfo', picRes: picRes.data });

    return {
      id: meRes.data.id,
      name: meRes.data.name,
      picture: picRes.data.data.url,
    };
  } catch (err) {
    logger.error({ function: 'facebook.getUserInfo', err });

    return {};
  }
};

const facebook = {
  getUserInfo,
};

export default facebook;
