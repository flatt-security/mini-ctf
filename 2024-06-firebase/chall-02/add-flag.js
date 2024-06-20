(async () => {
  /**
   * REDACTED
   */

  await firebase.auth().createUserWithEmailAndPassword('admin@flatt.tech', '<REDACTED>');
  await firebase.auth().signInWithEmailAndPassword('admin@flatt.tech', '<REDACTED>');
  const adminUserId = firebase.auth().currentUser.uid;

  const FLAG = "<REDACTED>"
  await firebase.firestore().collection('publicPosts').add({
    name: 'admin@flatt.tech',
    body: "Hello, I'm admin!",
    createdBy: adminUserId,
  });
  await firebase.firestore().collection('privatePosts').doc('0').collection(adminUserId).add({
    name: 'FLAG',
    body: FLAG,
    createdBy: adminUserId,
  });
})();
