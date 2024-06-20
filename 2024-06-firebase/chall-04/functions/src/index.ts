import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {getAuth} from "firebase-admin/auth";
import {v4 as uuidv4} from "uuid";

admin.initializeApp();

export const initializeUser = functions
  .region("asia-northeast1")
  .auth
  .user()
  .onCreate(async (user) => {
    try {
      await getFirestore().collection("users").doc(user.uid).set({
        email: user.email,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      functions.logger.error(e);
      throw new functions.auth.HttpsError("unavailable", String(e));
    }
  });

export const createLog = functions
  .region("asia-northeast1")
  .firestore
  .document("users/{userId}/notes/{noteId}")
  .onCreate(async (snapshot) => {
    try {
      await getFirestore().collection("logs").add({
        path: snapshot.ref.path,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      functions.logger.error(e);
      throw new functions.auth.HttpsError("unavailable", String(e));
    }
  });

export const exportNote = functions
  .https
  .onCall(async (data, ctx) => {
    try {
      if (!ctx.auth) {
        throw new functions.auth.HttpsError("permission-denied", "error");
      }

      const doc = await getFirestore().doc(data.path).get();
      const docData = doc.data();

      if (docData === undefined) {
        throw new functions.auth.HttpsError("unavailable", "error");
      }

      const bucket = getStorage().bucket();
      const userId = doc.ref.path.split("/")[1];
      const storagePath = `exports/${userId}/${uuidv4()}.json`;
      await bucket.file(storagePath).save(JSON.stringify(docData));

      const adminUserId = (
        await getAuth().getUserByEmail("admin@flatt.tech")
      ).uid;
      await bucket.file(storagePath).setMetadata({
        metadata: {
          allowedUserId: adminUserId,
        },
      });

      return {
        storagePath,
      };
    } catch (e) {
      functions.logger.error(e);
      throw new functions.auth.HttpsError("unavailable", String(e));
    }
  });
