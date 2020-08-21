////////////////////////////

// function scaryClown() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(":clown_face:");
//     }, 2000);
//   });
// }
// async function msg() {
//   const msg = await scaryClown();
//   console.log("Message:", msg);
// }

// console.log(json.item.album.id);

const spotifyFetch = async () => {
  const access_token = window.location.hash.replace("&", "=").split("=");
  // console.log(access_token);

  const headers = {
    headers: {
      Authorization: "Bearer " + access_token[1],
    },
  };

  const currentlyPlayingRequest = new Request(
    "https://api.spotify.com/v1/me/player/currently-playing",
    headers
  );

  await fetch(currentlyPlayingRequest)
    .then((response) => {
      // console.log(response);
      return response.json();
    })
    .then((data) => {
      console.log(data);
      console.log("Artist: " + data.item.artists[0].name);
      console.log("Artist URL: " + data.item.artists[0].external_urls.spotify);
      console.log("Song: " + data.item.name);
      console.log("Duration: " + data.item.duration_ms);
      console.log("Album Cover: " + data.item.album.images[0].url);
      console.log("Album Name: " + data.item.album.name);
      console.log("Album ID: " + data.item.album.id);
      // const songId = data.item.album.id;
      console.log("Release Date: " + data.item.album.release_date);
      console.log("Album Tracks: " + data.item.album.total_tracks);
      console.log("Album URL: " + data.item.album.external_urls.spotify);
      spotifyData = await data;
      return data;
    })
    .catch((err) => {
      if (
        err ==
        "SyntaxError: JSON.parse: unexpected end of data at line 1 column 1 of the JSON data"
      ) {
        return console.log("Play something fool");
      } else {
        console.log("Spotify Fetch Failed: ", err);
      }
    });
  // .then(
  //   fetch("https://api.spotify.com/v1/albums/" + songId, {
  //     headers: {
  //       Authorization: "Bearer " + access_token[1],
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => console.log(data))
  // );
};

spotifyFetch();

let spotifyData = {};

console.log(spotifyData);

console.log(data.item.album.id + "loadasddasadsasdadl");

////////////////////////////// THE TESTING GROUND 🚧

const access_token2 = window.location.hash.replace("&", "=").split("=");

fetch("https://api.spotify.com/v1/albums/6idcBzDYuwhoB92L9gyyQv", {
  headers: {
    Authorization: "Bearer " + access_token2[1],
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data));
