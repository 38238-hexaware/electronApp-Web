const { stringify } = require('querystring');
const google = require('googleapis');
const co = require('co');
const fetch = require('node-fetch');
const windowManager = require('electron-window-manager');
// eslint-disable-next-line import/no-extraneous-dependencies
const { BrowserWindow } = require('electron');

const OAuth2 = google.auth.OAuth2;

/* eslint-disable camelcase */

function getAuthenticationUrl(scopes, clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {
	const oauth2Client = new OAuth2(
		'8157699356-nel0cnuv95pf2lqpv5q45lls0bka6igp.apps.googleusercontent.com',
		'1EAwIA6opzvpDvhypLT9l3LE',
		'http://localhost:3000/success'
	);
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
		scope: scopes // If you only need one scope you can pass it as string
	});
	return url;
}

function authorizeApp(url, browserWindowParams) {
	return new Promise((resolve, reject) => {
		//const win = new BrowserWindow(browserWindowParams || {'use-content-size': true});

		let win = windowManager.createNew("Google Sigin", "Login", url);
		win.open();

		win.onReady(true, function (window) {

		});
		win.content().on('page-title-updated', function (title) {

			win.execute(`var remote = require('electron').remote;
                            var windowManager = remote.require('electron-window-manager');
                            var title = document.getElementsByTagName("title")[0].innerHTML;if(title=='Success'){setTimeout(()=>{ var window = remote.getCurrentWindow(); 
			   const fs = require('fs');
               fs.writeFileSync('./data.json',"SignIn","utf8");
		       window.close();
				
				})}`);
		});

		// win.on('page-title-updated', () => {

		// 	setImmediate(() => {
		// 		const title = win.getTitle();
		// 		if (title.startsWith('Denied')) {
		// 			reject(new Error(title.split(/[ =]/)[2]));
		// 			win.removeAllListeners('closed');
		// 			win.close();
		// 		} else if (title.startsWith('Success')) {
		// 			resolve(title.split(/[ =]/)[2]);
		// 			win.removeAllListeners('closed');
		// 			win.close();
		// 		}
		// 	});
		// });
	});
}

module.exports = function electronGoogleOauth(browserWindowParams, httpAgent) {
	function getAuthorizationCode(scopes, clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {

		const url = getAuthenticationUrl(scopes, clientId, clientSecret, redirectUri);
		return authorizeApp(url, browserWindowParams);
	}

	const getAccessToken = co.wrap(function* (scopes, clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {
		const authorizationCode = yield getAuthorizationCode(scopes, clientId, clientSecret, redirectUri);

		const data = stringify({
			code: authorizationCode,
			client_id: '8157699356-nel0cnuv95pf2lqpv5q45lls0bka6igp.apps.googleusercontent.com',
			client_secret: '1EAwIA6opzvpDvhypLT9l3LE',
			grant_type: 'authorization_code',
			redirect_uri: 'http://localhost:3000/success'
		});

		const res = yield fetch('https://accounts.google.com/o/oauth2/token', {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: data,
			agent: httpAgent
		});

		return yield res.json();
	});

	return { getAuthorizationCode, getAccessToken };
};
