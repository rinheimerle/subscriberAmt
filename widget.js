const link = document.getElementById("connect");
console.log(link);

const getCookieValue = (cookieName) => {
	const cookieValue = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
	return cookieValue ? cookieValue.pop() : '';
}

if (window.location.hash.includes("access_token")) {
  document.write("I JUST CONNECTED");
  document.cookie = "accessToken=" + window.location.hash?.split("&").find(param => param.includes("access_token"))?.split("=")[1];
  window.location.replace("https://rinheimerle.github.io/subscriberAmt/");
}

const accessToken = getCookieValue("accessToken");

const clientID = "xje2uk6zcuxl6kn1kyylxy1ql134n5";
const params = `?response_type=token+id_token&client_id=${clientID}&redirect_uri=https://rinheimerle.github.io/subscriberAmt/&scope=channel%3Aread%3Asubscriptions+openid&output=embed`;
const baseURL = "https://api.twitch.tv/helix/";

if (!accessToken) {
  link.innerHTML = "Connect to Twitch!";
  link.href = `https://id.twitch.tv/oauth2/authorize${params}`;
} else {
  link.innerHTML = "Connected to Twitch -- thanks!"
}

const currentTierPlans = {
  1000: 5.99,
  2000: 20.99,
  3000: 25.99,
}
const subscriberCount = getCookieValue("subscriberCount");
const userId = getCookieValue("userId");

const subscriberParams = {
  authorization: `Bearer ${accessToken}`,
  clientID,
}

const usersURL = baseURL + `users`;
  
if (userId.match('^$')) {
  try {
    const response = await fetch(usersURL, {
      headers: {
        "Authorization": subscriberParams.authorization,
        "Client-Id": clientID,
      }
    });

    if (!response.ok) {
      throw new Error("something's wrong!!!");
    }

    const json = await response.json();
    document.cookie = "userId=" + json.data[0].id;
  } 
  catch(e) {
    console.log(e);
  }
}

const subscribersURL = baseURL + `subscriptions?broadcaster_id=${userId}`;

try {
  const response = await fetch(subscribersURL, {
    headers: {
      "Authorization": subscriberParams.authorization,
      "Client-Id": clientID,
    }
  });

  if (!response.ok) {
    throw new Error("Error fetching subscriber count");
  }

  const json = await response.json();

  if (json.total !== subscriberCount) {
    document.cookie = "subscriberCount=" + json.total;

    // pull out broadcaster
    const subscribers = json.data;
    // TODO pull out the broadcaster from this list
    const value = subscribers.reduce((acc, currentValue) => acc + currentTierPlans[currentValue.tier], 0);
    
    if (Number(value)) {
      document.getElementById("subscriberCount").innerHTML += subscriberCount;
      document.getElementById("subscriberAmount").innerHTML += Math.round(Number(value));
    }
  }

} 
catch (e) {
  console.log(e);
}