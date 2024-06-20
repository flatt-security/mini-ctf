<script setup lang="ts">
import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { useCurrentUser, useFirebaseAuth } from 'vuefire';
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';

const auth = useFirebaseAuth()!;
const firestore = getFirestore(firebaseApp);

const email = ref('');
const password = ref('');
const user = useCurrentUser();
const signIn = () => {
  try {
    signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    alert(`Failed to sign in: ${e}`);
  }
};

const flag = ref('');
const getFlag = async () => {
  try {
    const flagDoc = await getDoc(doc(collection(firestore, 'flags'), 'flag'));
    flag.value = flagDoc.data()!.flag;
  } catch (e) {
    alert(`Failed to get flag: ${e}`);
  }
};
</script>

<template>
  <div v-if="user">
    <p>Signed in as {{ user.email }}</p>
  </div>
  <div v-else style="margin-bottom: 30px">
    <p>Not signed in</p>
    <input
      v-model="email"
      style="margin-right: 20px"
      type="email"
      placeholder="example@flatt.example.test"
    />
    <input
      v-model="password"
      style="margin-right: 20px"
      type="password"
      placeholder="password"
    />
    <button @click="signIn">Sign in</button>
  </div>
  <button @click="getFlag">Get flag</button>
  {{ flag }}
</template>

<style scoped></style>
