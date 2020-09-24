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
  console.log("spotifyPlaying");
  const response = await fetch("https://api.spotify.com/v1/me/player", headers);
  return response.status === 200
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

const htmlPrint = (playingData, getAlbumData, analysisData) => {
  console.log("htmlPrint");
  const playing = {
    artist: {
      name: playingData.item.artists[0].name,
      url: playingData.item.artists[0].external_urls.spotify,
    },
    album: {
      name: playingData.item.album.name,
      url: playingData.item.album.external_urls.spotify,
      cover: playingData.item.album.images[0].url,
    },
    label: {
      name: getAlbumData.label,
      url:
        'https://open.spotify.com/search/label%3A "' +
        getAlbumData.label +
        '"/albums',
    },
    track: {
      name:
        // playingData.item.name,
        playingData.item.name.length > 25
          ? playingData.item.name.substring(0, 25) + "..."
          : playingData.item.name,
      duration:
        Math.floor(playingData.item.duration_ms / 60000) +
        ":" +
        (((playingData.item.duration_ms % 60000) / 1000).toFixed(0) < 10
          ? "0"
          : "") +
        ((playingData.item.duration_ms % 60000) / 1000).toFixed(0),
      number: playingData.item.track_number + "/" + getAlbumData.total_tracks,
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
    },
  };

  const playingArray = [
    [playing.artist, "artist"],
    [playing.album, "album"],
    [
      `${playing.track.name} / ${playing.track.duration} / ${playing.track.number}`,
      "track",
    ],
    [playing.label, "label"],
    [playing.track.bpm, "bpm"],
    [playing.track.key, "key"],
    [playing.track.mode, "mode"],
    [playing.track.signature, "signature"],
    [playing.track.releaseDate, "releaseDate"],
  ];

  const htmlText = (a) => {
    a.map((x) => {
      Object.keys(x[0])[1] === "url"
        ? ((document.getElementById(x[1]).innerHTML = x[0].name),
          (document.getElementById(x[1]).href = x[0].url),
          (document.getElementById(x[1]).style.textDecoration = "underline"))
        : (document.getElementById(x[1]).innerHTML = x[0]);
    });
  };

  htmlText(playingArray);

  document.getElementById("cover").src = playing.album.cover;
};

/// THE API DATA ROUTER

async function dataRouter() {
  // const refresher = (s) => {
  //   setInterval(() => {
  //     dataRouter();
  //   }, s * 1000);
  // };
  console.log("dataRouter");

  const data = await spotifyPlaying();
  const fetchStatus = data[0].status;

  console.log(fetchStatus);

  if (fetchStatus === 200) {
    const playingData = data[1];
    const currentTrack =
      data[1].item.name.length > 25
        ? data[1].item.name.substring(0, 25) + "..."
        : data[1].item.name;
    const displayTrack = document
      .getElementById("track")
      .innerHTML.split(" / ")[0];
    if (displayTrack != currentTrack) {
      const getAlbumData = await spotifyGetAlbum(playingData);
      const analysisData = await spotifyAnalysis(playingData);
      htmlPrint(playingData, getAlbumData, analysisData);
      // refresher(10);
    }
  } else if (fetchStatus === 401) {
    if (window.location.pathname === "/callback.html") {
      (document.getElementById("cover").src = "assets/expiredError.png"),
        setTimeout(() => {
          window.location.href = "index.html";
        }, 3000);
    }
  } else if (fetchStatus === 204) {
    return (
      [
        "artist",
        "album",
        "label",
        "track",
        "bpm",
        "key",
        "mode",
        "signature",
        "releaseDate",
      ].map((x) => {
        document.getElementById(x).innerHTML =
          '<span class="loadingAni" style="text-decoration: none">. . . </span>';
        document.getElementById(x).removeAttribute("href");
        document.getElementById(x).style.textDecoration = "none";
      }),
      (document.getElementById("cover").src = "assets/spotifyError.png")
    );
  } else {
    console.log(fetchStatus, "Will retry in 10s");
    // refresher(10);
  }
}

// if (window.location.pathname === "/callback.html") {
//   dataRouter();
// }

// THE REFRESHER

if (window.location.pathname === "/callback.html") {
  dataRouter();
  setInterval(() => {
    dataRouter();
  }, 10000);
}
