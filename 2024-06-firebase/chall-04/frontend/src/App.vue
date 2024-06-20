<script setup lang="ts">
import { getFunctions, httpsCallable } from 'firebase/functions';
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
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
} from 'firebase/storage';

const auth = useFirebaseAuth()!;
const firestore = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);
const storage = getStorage(firebaseApp);

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

const newNote = ref('');
const postNote = async () => {
  try {
    const ref = collection(
      doc(collection(firestore, 'users'), user.value?.uid),
      'notes',
    );
    const body = {
      note: newNote.value,
    };
    await addDoc(ref, body);
    newNote.value = '';
    await refreshNotes();
  } catch (e) {
    alert(`Failed to post: ${e}`);
  }
};

const notes = ref<
  {
    id: string;
    path: string;
    data: DocumentData;
  }[]
>([]);

watch([user], async () => {
  if (user.value !== null) {
    await refreshNotes();
  }
});

const refreshNotes = async () => {
  notes.value = [];

  const snapshot = await getDocs(
    collection(doc(collection(firestore, 'users'), user.value?.uid), 'notes'),
  );
  snapshot.docs.forEach((doc) => {
    notes.value.push({
      id: doc.id,
      path: doc.ref.path,
      data: doc.data(),
    });
  });
};

const storagePath = ref('');
const exporting = ref(false);
const exportNote = async (id: string) => {
  storagePath.value = '';
  exporting.value = true;

  const exportNoteFunction = httpsCallable(functions, 'exportNote');

  try {
    const res = await exportNoteFunction({
      path: `users/${user.value?.uid}/notes/${id}`,
    });
    storagePath.value = (res.data as any).storagePath;
  } catch (e) {
    alert(`Failed to export note: ${e}`);
  } finally {
    exporting.value = false;
  }
};

const opening = ref(false);
const openExportedFile = async () => {
  opening.value = true;
  if (storagePath.value === '') {
    return;
  }

  try {
    const url = await getDownloadURL(storageRef(storage, storagePath.value));
    window.open(url, '_blank');
  } catch (e) {
    alert(`Failed to open exported file: ${e}`);
  } finally {
    opening.value = false;
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
      <v-text-field v-model="newNote" label="body" />
      <v-btn
        @click="postNote"
        :disabled="newNote.length === 0"
        color="primary"
        text="post"
      />

      <v-divider class="mb-4 mt-4" />

      <v-btn
        class="mb-2"
        @click="refreshNotes"
        color="primary"
        text="refresh"
      />
      <v-list v-if="notes.length">
        <v-list-item v-for="note in notes" :key="note.id">
          <v-btn @click="exportNote(note.id)" text="export" color="primary" />
          {{ note.data.note }}
          <v-divider />
        </v-list-item>
      </v-list>
      <div v-else>何か投稿してみましょう！</div>

      <v-alert v-if="storagePath" class="mt-4" type="success">
        <p>{{ storagePath }} にエクスポートされました。</p>
        <v-btn
          v-if="!opening"
          @click="openExportedFile"
          class="mt-2"
          text="ファイルを開く"
        />
        <v-progress-circular v-if="opening" color="white" indeterminate />
      </v-alert>

      <v-progress-circular
        v-if="exporting"
        class="mt-2"
        color="info"
        indeterminate
      />

      <v-divider class="mb-4 mt-4" />

      <p class="mb-2">Signed in as {{ user.email }}</p>
      <v-btn @click="signOut" color="primary" text="Sign out" />
    </div>
  </v-container>
</template>

<style scoped></style>
