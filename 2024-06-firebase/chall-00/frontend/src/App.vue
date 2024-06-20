<script setup lang="ts"></script>

<template>
  <p>まず、DevToolsを開き、Consoleタブから以下のコードを実行してみましょう。</p>
  <p>
    このコードにより、<code>firebase.js</code>
    に定義された関数等が利用できるようになります。
  </p>
  <pre>
    <code>
      (async () => {
        const load = (url) =>
          new Promise((resolve) => {
            const script = document.createElement("script");
            script.setAttribute("src", url);
            script.onload = resolve;
            document.body.appendChild(script);
          });

          await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
          await load("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js");
      })();</code>
  </pre>

  <br />

  <p>
    次に、FirebaseOptions
    を引数として、 <code>firebase.initializeApp</code> を呼び出しましょう。
  </p>
  <p>
    FirebaseOptions は
    <code>frontend/src/firebase.ts</code> に定義してあります。
  </p>
  <p>
    このコードにより、実行中のコンテキストでこのアプリケーションがデプロイされているFirebaseとやり取りができるようになります。
  </p>
  <pre>
    <code>
      firebase.initializeApp({
        apiKey: 'AIzaSyBTn0 ...',
        ...[以下略]
      });</code>
  </pre>

  <br />

  <p>では、実際に Firestore からドキュメントを読み込んでみましょう。</p>
  <p>
    まず、あるコレクションからすべてのドキュメントを取得する際は以下のように
    QuerySnapshot を取得します。
  </p>
  <pre>
    <code>
      const snapshot = await firebase.firestore().collection('コレクション名').get();</code>
  </pre>

  <br />

  <p>
    この QuerySnapshot の
    <code>docs</code> プロパティにドキュメント (のリスト) が格納されています。
  </p>
  <p>
    各ドキュメント内のデータを取得する際は、<code>data()</code>
    メソッドを呼び出しましょう。
  </p>
  <pre>
    <code>
      snapshot.docs.forEach(doc => console.log(doc.data()));</code>
  </pre>

  <br />

  <p>なお、特定のドキュメントを取得する際は以下のようにしてください。</p>
  <pre>
    <code>
      const doc = await firebase.firestore().collection('コレクション名').doc('ドキュメントID').get();
      console.log(doc.data());
    </code>
</pre>

  <br />

  <p>以上でイントロダクションは終了です。</p>
  <p>
    この問題のフラグは <code>add-flag.js</code> を読むと分かる通り <code>flags</code> コレクションの
    <code>flag</code>
    ドキュメントに格納されているので、これまでのコードを組み合わせてアクセスしてみましょう。
  </p>
</template>

<style scoped>
pre {
  border: 1px solid white;
  border-radius: 10px;
}

code {
  color: #7fbfff;
}
</style>
