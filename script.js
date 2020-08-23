const signIn = () => {
  const clientID = "c6f698a558b04c13bed1b0a399af63ea";
  const redirectURL = "https://trackify-steel.vercel.app/callback.html";
  const scope = ["user-read-currently-playing", "user-read-playback-state"];

  window.location =
    "https://accounts.spotify.com/authorize?client_id=" +
    clientID +
    "&response_type=token&redirect_uri=" +
    redirectURL +
    "&scope=" +
    scope[0] +
    "%20" +
    scope[1];
};

const access_token = window.location.hash.replace("&", "=").split("=");

const headers = {
  headers: {
    Authorization: "Bearer " + access_token[1],
  },
};

const spotifyPlaying = async () => {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      headers
    );
    console.log(response);
    if (response.status != 200) {
      return console.log("401 - Account Token Expired");
    } else {
      json = await response.json();
      // console.log(json);
      return json;
    }
  } catch (error) {
    console.log(error);
    console.log("Play something fool!");
  }
};

const spotifyGetAlbum = async (data) => {
  const response = await fetch(
    "https://api.spotify.com/v1/albums/" + data.item.album.id,
    headers
  );
  json = await response.json();
  // console.log(json);
  return json;
};

const spotifyAnalysis = async (data) => {
  const response = await fetch(
    "https://api.spotify.com/v1/audio-analysis/" + data.item.id,
    headers
  );
  json = await response.json();
  // console.log(json);
  return json;
};

const htmlPrint = async (data, data2, data3) => {
  ////
  console.log(data);
  console.log(data2);
  console.log(data3);
  ////
  // console.log("/// Data from spotifyPlaying ///");
  // console.log("Artist: " + data.item.artists[0].name);
  // console.log("Artist URL: " + data.item.artists[0].external_urls.spotify);
  // console.log("Song: " + data.item.name);
  // console.log("Song Duration: " + data.item.duration_ms);
  // console.log("Song Progress: " + data.progress_ms);
  // console.log("Album Cover: " + data.item.album.images[0].url);
  // console.log("Album Name: " + data.item.album.name);
  // console.log("Album ID: " + data.item.album.id);
  // console.log("Album Release Date: " + data.item.album.release_date);
  // console.log("Album Tracks: " + data.item.album.total_tracks);
  // console.log("Album URL: " + data.item.album.external_urls.spotify);
  ////
  // console.log("/// Data from spotifyGetAlbum ///");
  // console.log("Album Label: " + data2.label);
  ////
  // console.log("/// Data from spotifyAnalysis ///");
  // console.log("Track BPM: " + data3.track.tempo);
  // console.log("Track KEY: " + data3.track.key);
  // console.log("Track MODE: " + data3.track.mode);
  // console.log("Track TIME SIGNATURE: " + data3.track.time_signature);
  ////

  const time = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = ((ms % 60000) / 1000).toFixed(0);
    return m + ":" + (s < 10 ? "0" : "") + s;
  };

  const mode = data3.track.mode === 0 ? "Minor" : "Major";
  const key = [
    "C",
    "C♯/D♭",
    "D",
    "D♯/E♭",
    "E",
    "F",
    "F♯/G♭",
    "G",
    "G♯/A♭",
    "A",
    "A♯/B♭",
    "B",
    "C",
  ];

  document.getElementById("artist").innerHTML = data.item.artists[0].name;
  document.getElementById("artist").href =
    data.item.artists[0].external_urls.spotify;
  document.getElementById("artist").style.textDecoration = "underline";

  document.getElementById("album").innerHTML = data.item.album.name;
  document.getElementById("album").href = data.item.album.external_urls.spotify;
  document.getElementById("album").style.textDecoration = "underline";

  document.getElementById("track").innerHTML =
    data.item.name +
    " / " +
    time(data.item.duration_ms) +
    " / " +
    data.item.track_number +
    "/" +
    data2.total_tracks;

  document.getElementById("label").innerHTML = data2.label;
  document.getElementById("label").href =
    "https://open.spotify.com/search/label%3A " + data2.label + "/albums";
  document.getElementById("label").style.textDecoration = "underline";

  document.getElementById("cover").src = data.item.album.images[0].url;
  document.getElementById("bpm").innerHTML = Math.round(data3.track.tempo);
  document.getElementById("key").innerHTML = key[data3.track.key];

  document.getElementById("mode").innerHTML = mode;

  document.getElementById("signature").innerHTML =
    data3.track.time_signature + "/4";

  document.getElementById("releasedate").innerHTML =
    data.item.album.release_date;
  // document.getElementById("loginButton").innerText = "Refresh";
};

async function dataRouter() {
  try {
    const data = await spotifyPlaying();
    const data2 = await spotifyGetAlbum(data);
    const data3 = await spotifyAnalysis(data);
    await htmlPrint(data, data2, data3);
  } catch (error) {
    error;
  }
}

dataRouter();

// setInterval(function () {
//   dataRouter();
// }, 5000);
