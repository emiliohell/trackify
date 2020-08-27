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
    redirectURL[0] +
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
  // console.log("spotifyPlaying");
  const response = await fetch("https://api.spotify.com/v1/me/player", headers);
  return response.status === 200 || 201
    ? [response, (json = await response.json())]
    : [response];
};

const spotifyGetAlbum = async (data) => {
  // console.log("spotifyGetAlbum");
  const response = await fetch(
    "https://api.spotify.com/v1/albums/" + data.item.album.id,
    headers
  );
  return (json = await response.json());
};

const spotifyAnalysis = async (data) => {
  // console.log("spotifyAnalysis");
  const response = await fetch(
    "https://api.spotify.com/v1/audio-analysis/" + data.item.id,
    headers
  );
  return (json = await response.json());
};

/// TO THE HTML

const htmlPrint = async (playingData, getAlbumData, analysisData) => {
  // console.log("htmlPrint");

  const artist = {
    name: playingData.item.artists[0].name,
    url: playingData.item.artists[0].external_urls.spotify,
    album: playingData.item.album.name,
    albumUrl: playingData.item.album.external_urls.spotify,
    track:
      // playingData.item.name,
      playingData.item.name.length > 25
        ? playingData.item.name.substring(0, 25) + "..."
        : playingData.item.name,
    trackDuration:
      Math.floor(playingData.item.duration_ms / 60000) +
      ":" +
      (((playingData.item.duration_ms % 60000) / 1000).toFixed(0) < 10
        ? "0"
        : "") +
      ((playingData.item.duration_ms % 60000) / 1000).toFixed(0),
    trackNumber:
      playingData.item.track_number + "/" + getAlbumData.total_tracks,
    label: getAlbumData.label,
    labelUrl:
      'https://open.spotify.com/search/label%3A "' +
      getAlbumData.label +
      '"/albums',
    cover: playingData.item.album.images[0].url,
    bpm: Math.round(analysisData.track.tempo),
    key: [
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
    ][analysisData.track.key],
    mode: analysisData.track.mode === 0 ? "Minor" : "Major",
    signature: analysisData.track.time_signature + "/4",
    releaseDate: playingData.item.album.release_date,
  };

  document.getElementById("artist").innerHTML = artist.name;
  document.getElementById("artist").href = artist.url;
  document.getElementById("artist").style.textDecoration = "underline";
  document.getElementById("album").innerHTML = artist.album;
  document.getElementById("album").href = artist.albumUrl;
  document.getElementById("album").style.textDecoration = "underline";
  document.getElementById("track").innerHTML =
    artist.track + " / " + artist.trackDuration + " / " + artist.trackNumber;
  document.getElementById("label").innerHTML = artist.label;
  document.getElementById("label").href = artist.labelUrl;
  document.getElementById("label").style.textDecoration = "underline";
  document.getElementById("cover").src = artist.cover;
  document.getElementById("bpm").innerHTML = artist.bpm;
  document.getElementById("key").innerHTML = artist.key;
  document.getElementById("mode").innerHTML = artist.mode;
  document.getElementById("signature").innerHTML = artist.signature;
  document.getElementById("releasedate").innerHTML = artist.releaseDate;
};

/// THE API DATA ROUTER

async function dataRouter() {
  // console.log("dataRouter");
  try {
    const data = await spotifyPlaying();
    const fetchStatus = data[0].status;
    const playingData = data[1];
    const currentTrack =
      data[1].item.name.length > 25
        ? data[1].item.name.substring(0, 25) + "..."
        : data[1].item.name;
    const displayTrack = document
      .getElementById("track")
      .innerHTML.split(" / ")[0];

    if (fetchStatus === 200 && displayTrack != currentTrack) {
      const getAlbumData = await spotifyGetAlbum(playingData);
      const analysisData = await spotifyAnalysis(playingData);
      await htmlPrint(playingData, getAlbumData, analysisData);

      // Auth has Expired error catcher:
    } else if (fetchStatus === 401) {
      window.location.pathname === "/callback.html" &&
        (document.getElementById("cover").src = "assets/expiredError.png");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);

      // No new Data error catcher:
    } else {
      // console.log("No new data / " + fetchStatus);
    }

    // Spotify is not Running Catcher and HTMLreset: (See To Do)
  } catch (err) {
    // console.log("error catcher / no info / spotify is not running");
    // console.log(err);
    const resetHtml =
      '<span class="loadingAni" style="text-decoration: none">. . . </span>';

    document.getElementById("artist").innerHTML = resetHtml;
    document.getElementById("artist").removeAttribute("href");
    document.getElementById("artist").style.textDecoration = "none";
    document.getElementById("album").innerHTML = resetHtml;
    document.getElementById("album").removeAttribute("href");
    document.getElementById("album").style.textDecoration = "none";
    document.getElementById("track").innerHTML = resetHtml;
    document.getElementById("label").innerHTML = resetHtml;
    document.getElementById("label").removeAttribute("href");
    document.getElementById("label").style.textDecoration = "none";
    document.getElementById("cover").src = "assets/spotifyError.png";
    document.getElementById("bpm").innerHTML = resetHtml;
    document.getElementById("key").innerHTML = resetHtml;
    document.getElementById("mode").innerHTML = resetHtml;
    document.getElementById("signature").innerHTML = resetHtml;
    document.getElementById("releasedate").innerHTML = resetHtml;
  }
}

// THE REFRESHER

if (window.location.pathname === "/callback.html") {
  dataRouter();
  setInterval(() => {
    dataRouter();
  }, 10000);
}
