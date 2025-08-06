(async () => {
  const clientId = '4f43778705934342ad54cd649d296d20';
  const clientSecret = '838e83cb56f54d68b8a4d41584266ea1';
  const redirectUri = 'https://cybrok3.github.io/callback';
  const authCode = 'AQC-y26eB2O4QXmbmvaDNxiE7VFyGOU2hH6UADFNu_dT0oYdH9m1sb1v_X0imEUqTW01QaS9VGD6vZluBG3kptGUmCwXeAbIHoPlM_0PpQRtNf7P2s-gxipZTn5m1IsmnVL6X21TmR8E8zB6znc1KFkGJzbSQJoCRRxSRFa4_QCO2jmNT4DTH80lV-cpFHiWnemFc1kjjAc8okTckV_UY5hXvxR4Kjpl1U04Db-N1sZ_lM2QuIpruiFDzW2dr6evrN_0DO09ZVDDLtXv1hXyFLo';
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