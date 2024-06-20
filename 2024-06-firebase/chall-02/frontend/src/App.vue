<script setup lang="ts">
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { useCurrentUser, useFirebaseAuth } from 'vuefire';
import { ref } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { watch } from 'vue';

const auth = useFirebaseAuth()!;
const firestore = getFirestore(firebaseApp);

const email = ref('');
const password = ref('');
const user = useCurrentUser();

const signUp = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    await signInWithEmailAndPassword(auth, email.value, password.value);
    await refresh();
  } catch (e) {
    alert(`Failed to sign up: ${e}`);
  }
};

const signIn = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    await refresh();
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

const name = ref('');
const body = ref('');
const publicPosts = ref<DocumentData[]>([]);
const privatePosts = ref<DocumentData[]>([]);

watch([user], async () => {
  if (user.value !== null) {
    await refresh();
  }
});

const refresh = async () => {
  try {
    publicPosts.value = (
      await getDocs(collection(firestore, 'publicPosts'))
    ).docs.map((doc) => doc.data());
    privatePosts.value = (
      await getDocs(
        collection(
          doc(collection(firestore, 'privatePosts'), '0'),
          user.value!.uid,
        ),
      )
    ).docs.map((doc) => doc.data());
  } catch (e) {
    alert(`Failed to refresh: ${e}`);
  }
};

const post = async (visibility: 'PUBLIC' | 'PRIVATE') => {
  const ref =
    visibility === 'PUBLIC'
      ? collection(firestore, 'publicPosts')
      : collection(
          doc(collection(firestore, 'privatePosts'), '0'),
          user.value!.uid,
        );
  try {
    await addDoc(ref, {
      name: name.value,
      body: body.value,
      createdBy: user.value!.uid,
    });
    alert('Success!');

    body.value = '';
    await refresh();
  } catch (e) {
    alert(`Failed to post: ${e}`);
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
      <v-btn
        @click="signUp"
        color="primary"
        text="Sign up"
        style="margin-right: 20px"
      />
      <v-btn @click="signIn" color="primary" text="Sign in" />
    </div>

    <div v-else>
      <div>
        <v-text-field label="name" v-model="name" />
        <v-textarea label="body" v-model="body" />
        <v-btn
          @click="post('PUBLIC')"
          :disabled="body.length === 0"
          color="primary"
          text="post (public)"
          class="mr-4"
        />
        <v-btn
          @click="post('PRIVATE')"
          :disabled="body.length === 0"
          color="primary"
          text="post (private)"
        />
      </div>

      <v-divider class="mt-6 mb-6" />

      <v-btn @click="refresh" color="primary" text="refresh" class="mb-4" />

      <v-row style="text-align: left">
        <v-col>
          <v-card>
            <v-card-title>Public posts</v-card-title>
            <v-card-item>
              <v-list>
                <v-list-item
                  v-for="(post, i) in publicPosts"
                  :key="i"
                  :title="post.body"
                  :subtitle="`from ${
                    post.name.length === 0 ? 'anonymous user' : post.name
                  }`"
                />
              </v-list>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title>Private posts</v-card-title>
            <v-card-item>
              <v-list>
                <v-list-item
                  v-for="(post, i) in privatePosts"
                  :key="i"
                  :title="post.body"
                  :subtitle="`from ${post.name}`"
                />
              </v-list>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
      <v-divider class="mt-6 mb-6" />

      <p class="mb-2">Signed in as {{ user.email }}</p>
      <v-btn @click="signOut" color="primary" text="Sign out" />
    </div>
  </v-container>
</template>

<style scoped></style>
