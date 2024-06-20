import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

admin.initializeApp();

export const initializeUser = functions
  .auth
  .user()
  .onCreate(async (user) => {
    try {
      await getFirestore().collection("users").doc(user.uid).set({
        clicks: 0,
      });

      await getAuth().setCustomUserClaims(user.uid, {
        tier: "BRONZE",
        clicks: 0,
      });
    } catch (e) {
      functions.logger.error(e);
      throw new functions.auth.HttpsError("unavailable", String(e));
    }
  });

export const updateTier = functions
  .firestore
  .document("/users/{userId}")
  .onUpdate(async (change, ctx) => {
    const data = change.after.data();
    try {
      let tier;

      if (data.clicks < 10) {
        tier = "BRONZE";
      } else if (data.clicks < 100) {
        tier = "SILVER";
      } else if (data.clicks < 3133333337) {
        tier = "GOLD";
      } else {
        tier = "HACKER";
      }

      await getAuth().setCustomUserClaims(ctx.params.userId, {
        tier,
        ...data,
      });

      return "OK";
    } catch (e) {
      functions.logger.error(e);
      throw new functions.auth.HttpsError("unavailable", String(e));
    }
  });
