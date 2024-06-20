<script setup lang="ts">
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { useCurrentUser, useFirebaseAuth } from 'vuefire';
import { ref } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
} from 'firebase/auth';
import flattLogo from './flatt-logo.png';

const auth = useFirebaseAuth()!;
const firestore = getFirestore(firebaseApp);

const email = ref('');
const password = ref('');
const user = useCurrentUser();

const signUp = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    alert(`Failed to sign up: ${e}`);
  }
};
const signIn = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    alert(`Failed to sign in: ${e}`);
  }
};
const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    alert(`Failed to sign out: ${e}`);
  }
};

const submitting = ref(false);
const clickFlattSecurity = async () => {
  submitting.value = true;
  try {
    const currentClicks = (await getDoc(doc(collection(firestore, 'users'), user.value?.uid))).data()!.clicks;
    await updateDoc(doc(collection(firestore, 'users'), user.value?.uid), {
      clicks: currentClicks + 1,
    });
    alert('Clicked Flatt Security!')
  } catch (e) {
    alert(`Failed to click Flatt Security: ${e}`);
  } finally {
    submitting.value = false;
  }
};

const checkCurrentClicks = async () => {
  try {
    await getAuth().currentUser!.getIdToken(true);
    const claims = (await getAuth().currentUser?.getIdTokenResult())?.claims!;
    alert(`You have clicked Flatt Security ${claims.clicks} times!`);
  } catch (e) {
    alert(`Failed to get current clicks: ${e}`);
  }
};

const checkTier = async () => {
  try {
    await getAuth().currentUser!.getIdToken(true);
    const claims = (await getAuth().currentUser?.getIdTokenResult())?.claims!;
    alert(`Your tier is ${claims.tier}`);

    if (claims.tier === 'HACKER') {
      alert('Congratulations! Now you can get the flag!');
    } else {
      alert('Try harder!');
    }
  } catch (e) {
    alert(`Failed to get current clicks: ${e}`);
  }
};
</script>

<template>
  <v-container>
    <div v-if="!user">
      <v-text-field
        v-model="email"
        type="email"
        placeholder="example@flatt.tech"
      />
      <v-text-field v-model="password" type="password" placeholder="password" />
      <v-btn @click="signUp" text="Sign up" style="margin-right: 20px" />
      <v-btn @click="signIn" text="Sign in" />
    </div>

    <div v-else>
      <img
        v-if="!submitting"
        class="flatt-image mt-6 mb-6"
        :src="flattLogo"
        @click="clickFlattSecurity"
      />
      <v-progress-circular
        v-else
        indeterminate size="large"
      />

      <v-divider class="mt-6 mb-6" />

      <v-btn @click="checkTier()" text="Check my tier" />
      <v-btn class="ml-4" @click="checkCurrentClicks()" text="Check current clicks" />

      <v-divider class="mt-6 mb-6" />

      <p class="mb-2">Signed in as {{ user.email }}</p>
      <v-btn @click="signOut" text="Sign out" />
    </div>
  </v-container>
</template>

<style scoped>
.flatt-image {
  width: 300px;
  border-radius: 10px;
  cursor: pointer;
}

.flatt-image:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
  opacity: 0.9;
}
</style>
