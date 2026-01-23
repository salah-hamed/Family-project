// app.js - Firebase config كامل لـ Family Project
// استخدم مع Firebase SDKs compat v10.14.1

// تهيئة Firebase بكونفج بتاعك
const firebaseConfig = {
  apiKey: "AIzaSyAato5NfjFNO2rvOBpZxTfDdJVfdQNdZ4M",
  authDomain: "kidsup-e998d.firebaseapp.com",
  projectId: "kidsup-e998d",
  storageBucket: "kidsup-e998d.firebasestorage.app",
  messagingSenderId: "959800471628",
  appId: "1:959800471628:web:51bfdc7a5209de7e7e44e9",
  measurementId: "G-V97ETZX7K0"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ========================================
// دوال Auth
// ========================================
async function fpSignUp(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    // إنشاء document للمستخدم في Firestore تلقائيًا
    await fpCreateUserDoc(userCredential.user);
    return userCredential;
  } catch (error) {
    throw new Error('خطأ في التسجيل: ' + error.message);
  }
}

async function fpSignIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential;
  } catch (error) {
    throw new Error('خطأ في الدخول: ' + error.message);
  }
}

async function fpSignOut() {
  return auth.signOut();
}

// ========================================
// إدارة Firestore
// ========================================
async function fpCreateUserDoc(user) {
  const userRef = db.collection('users').doc(user.uid);
  await userRef.set({
    email: user.email,
    uid: user.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    courseActive: false, // الكورس غير مفعّل افتراضيًا
    activatedBy: null,   // مين فعّل له الكورس
    activatedAt: null
  }, { merge: true });
}

async function fpActivateCourseByEmail(adminEmail, userEmail) {
  // البحث عن المستخدم بالإيميل
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', userEmail).limit(1).get();
  
  if (snapshot.empty) {
    throw new Error('المستخدم غير موجود في قاعدة البيانات');
  }
  
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  
  // تحديث الصلاحيات
  await userDoc.ref.update({
    courseActive: true,
    activatedBy: adminEmail,
    activatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  return { success: true, userId: userData.uid, message: `تم تفعيل الكورس لـ ${userEmail}` };
}

async function fpCheckCourseAccess(userUid) {
  const userDoc = await db.collection('users').doc(userUid).get();
  if (!userDoc.exists) return false;
  return userDoc.data().courseActive === true;
}

// ========================================
// مراقب حالة اليوزر (للـ index.html)
// ========================================
function fpOnAuthStateChanged(callback) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const hasAccess = await fpCheckCourseAccess(user.uid);
      callback(user, hasAccess);
    } else {
      callback(null, false);
    }
  });
}

// تصدير الدوال للاستخدام في HTML
window.fpSignUp = fpSignUp;
window.fpSignIn = fpSignIn;
window.fpSignOut = fpSignOut;
window.fpActivateCourseByEmail = fpActivateCourseByEmail;
window.fpOnAuthStateChanged = fpOnAuthStateChanged;
