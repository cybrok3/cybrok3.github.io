(async () => {
  const clientId = '4f43778705934342ad54cd649d296d20';
  const clientSecret = '838e83cb56f54d68b8a4d41584266ea1';
  const redirectUri = 'https://cybrok3.github.io/callback';
  const authCode = 'AQCqMCRmPZUOukfcGS3mBXjy3QpeK1c-BjZ_zC8Cn6yLpFscfUv1VwwMY4ZasJMtQ0ez_t-z8Oi19k9P_JVaULnYyR6OGpOcUYaWZK7oWM6e7nMAEbAcf1SDBmb1E8mVIKppiHw_apQ1LaX_qHDRzijamIlfq5k1DYzy4F0OAHuUmX1uFAbYnIgMy-slG_h94EVkb69mRiLB04dNYQ';
  async function getTokens() {
    console.log('Starting token request...');
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();
      console.log('Response from Spotify:', data);

      if (data.refresh_token) {
        console.log('\nUse this REFRESH TOKEN in your env vars:\n', data.refresh_token);
      } else {
        console.error('No refresh token received! Check the auth code or settings.');
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  }

  await getTokens();
})();