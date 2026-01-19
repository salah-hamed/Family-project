// ضع Firebase config هنا من Console
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "...firebaseapp.com",
  projectId: "...",
  // باقي الحقول
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// هيلبرز: onAuthStateChanged, getDoc, setDoc, إلخ للـ index.html أيضًا لعرض حالة اليوزر
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById('user-info');
  if (user) userInfo.innerHTML = `مرحباً ${user.email} | <button onclick="firebase.auth().signOut()">خروج</button> | <a href="course.html">الكورس</a> | <a href="admin.html">أدمن</a>`;
});
