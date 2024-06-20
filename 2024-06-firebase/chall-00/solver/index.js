(async () => {
  const load = (url) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.setAttribute("src", url);
      script.onload = resolve;
      document.body.appendChild(script);
    });
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js");

  firebase.initializeApp({
    apiKey: "AIzaSyBTn0lBewM5T7UJPY4mKhZHZCN1I6Nxzew",
    authDomain: "flatt-minictf-practice.firebaseapp.com",
    projectId: "flatt-minictf-practice",
    storageBucket: "flatt-minictf-practice.appspot.com",
    messagingSenderId: "539316080413",
    appId: "1:539316080413:web:837b1bb20d77175b3d9bf4"
  });

  // flags コレクション内のドキュメントをすべて取得
  const snapshot = await firebase.firestore().collection('flags').get();
  snapshot.docs.forEach(doc => console.log(doc.data()));

  // flags コレクション内の flag ドキュメントを取得
  const doc = await firebase.firestore().collection('flags').doc('flag').get();
  console.log(doc.data());
})();
