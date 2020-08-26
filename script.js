/// THE SIGN IN

const signIn = () => {
  const clientID = "c6f698a558b04c13bed1b0a399af63ea";
  const redirectURL = [
    "https://trackify-steel.vercel.app/callback.html",
    "http://127.0.0.1:5501/callback.html",
  ];
  const scope = ["user-read-currently-playing", "user-read-playback-state"];

  window.location =
    "https://accounts.spotify.com/authorize?client_id=" +
    clientID +
    "&response_type=token&redirect_uri=" +
    redirectURL[1] +
    "&scope=" +
    scope
      .map((x) => x + "%20")
      .join("")
      .slice(0, -3);
};

/// THE API FETCHES

const headers = {
  headers: {
    Authorization:
      "Bearer " + window.location.hash.replace("&", "=").split("=")[1],
  },
};

const spotifyPlaying = async () => {
  console.log("spotifyPlaying");
  const response = await fetch("https://api.spotify.com/v1/me/player", headers);
  return response.status === 200 || 201
    ? [response, (json = await response.json())]
    : [response];
};

const spotifyGetAlbum = async (data) => {
  console.log("spotifyGetAlbum");
  const response = await fetch(
    "https://api.spotify.com/v1/albums/" + data.item.album.id,
    headers
  );
  return (json = await response.json());
};

const spotifyAnalysis = async (data) => {
  console.log("spotifyAnalysis");
  const response = await fetch(
    "https://api.spotify.com/v1/audio-analysis/" + data.item.id,
    headers
  );
  return (json = await response.json());
};

/// TO THE HTML

const htmlPrint = async (data, data2, data3) => {
  console.log("htmlPrint");
  ////
  // console.log(data);
  // console.log(data2);
  // console.log(data3);
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

  const trackTime = (ms) => {
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
    trackTime(data.item.duration_ms) +
    " / " +
    data.item.track_number +
    "/" +
    data2.total_tracks;

  document.getElementById("label").innerHTML = data2.label;
  document.getElementById("label").href =
    'https://open.spotify.com/search/label%3A "' + data2.label + '"/albums';
  document.getElementById("label").style.textDecoration = "underline";

  document.getElementById("cover").src = data.item.album.images[0].url;
  document.getElementById("bpm").innerHTML = Math.round(data3.track.tempo);
  document.getElementById("key").innerHTML = key[data3.track.key];

  document.getElementById("mode").innerHTML = mode;

  document.getElementById("signature").innerHTML =
    data3.track.time_signature + "/4";

  document.getElementById("releasedate").innerHTML =
    data.item.album.release_date;
};

/// THE API DATA ROUTER

async function dataRouter() {
  console.log("dataRouter");
  try {
    const data = await spotifyPlaying();
    const spotifyPlayingStatus = data[0].status;
    const spotifyPlayingData = data[1];
    const currentTrack = data[1].item.name;
    const displayTrack = document
      .getElementById("track")
      .innerHTML.split(" / ")[0];

    if (spotifyPlayingStatus === 200 && displayTrack != currentTrack) {
      const spotifyGetAlbumData = await spotifyGetAlbum(spotifyPlayingData);
      const spotifyAnalysisData = await spotifyAnalysis(spotifyPlayingData);
      await htmlPrint(
        spotifyPlayingData,
        spotifyGetAlbumData,
        spotifyAnalysisData
      );

      // Auth has Expired error catcher:
    } else if (spotifyPlayingStatus === 401) {
      window.location.pathname === "/callback.html" &&
        (document.getElementById("cover").src = "assets/expiredError.png");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);

      // No new Data error catcher:
    } else {
      console.log("No new data");
      console.log(spotifyPlayingStatus);
    }

    // Spotify is not Running Catcher: (See To Do)
  } catch (err) {
    document.getElementById("cover").src = "assets/spotifyError.png";
    console.log("error catcher / no info / spotify is not running");
    console.log(err);
  }
}

// THE REFRESHER

if (window.location.pathname === "/callback.html") {
  dataRouter();
  setInterval(() => {
    dataRouter();
  }, 10000);
}
