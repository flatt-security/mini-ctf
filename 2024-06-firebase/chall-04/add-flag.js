(async () => {
  /**
   * REDACTED
   */

  await firebase.auth().createUserWithEmailAndPassword('admin@flatt.tech', '<REDACTED>');
  await firebase.auth().signInWithEmailAndPassword('admin@flatt.tech', '<REDACTED>');
  const adminUserId = firebase.auth().currentUser.uid;

  const FLAG = "<REDACTED>"
  await firebase.firestore().collection('users').doc(adminUserId).collection('notes').add({
    note: FLAG,
  });
})();
