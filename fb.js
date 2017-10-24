<script data-main="scripts/main" src="scripts/require.js"></script>

define(['facebook'], function(FB){
    FB.init({
      appId      : '1391224837613302',
      version    : 'v2.10'
    });
    FB.getLoginStatus(function(response) {
      console.log(response);
    });
  });