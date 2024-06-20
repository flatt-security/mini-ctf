(async () => {
  /**
   * REDACTED
   */

  const FLAG = "<REDACTED>"
  await firebase.firestore().collection('flags').doc('flag').set({
    flag: FLAG,
  });
})();
