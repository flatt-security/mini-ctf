# Flatt Security mini CTF #1, #2

https://flatt.connpass.com/event/279472/

https://flatt.connpass.com/event/287856/

## 出題した問題

[問題文](graphql/chall)
[配布物](graphql/chall/dist.zip)

| Challenge name | Difficulty | Category | Points | Author | Solves (#1, #2) |
|----------------|------------|----------|--------|--------|-----------------|
| welcome        | baby       | web      | 100    | akiym  | 17, 20          |
| complexity     | easy       | web      | 200    | akiym  | 2, 6            |
| dos            | medium     | web      | 300    | akiym  | 2, 0            |
| smash          | hard       | web      | 400    | akiym  | 5, 1            |

<details>
  <summary>競技中に公開されたヒント</summary>

```
## welcomeのヒント
<https://graphql.org/learn/queries/#inline-fragments>

## complexityのヒント
listUsers!

## dosのヒント1
<https://graphql.org/learn/queries/#aliases>

## dosのヒント2
searchUsersからfollowersがたくさん呼ばれたら？

## smashのヒント
validationRulesの実行時にエラーになったら？
```

</details>

#2では#1と同一の問題を出題しましたが、問題の取り組みやすさの改善と非想定解を潰すため、以下の点が変更されています。

- query size limitをかなり緩めてgraphiqlの補完のintrospection queryが走るように
- graphiqlを配信するように
- graphql-depth-limitのバグ修正(存在しないfragmentを展開しようとするだけでエラーにならないように)
- parentIdを埋めるように
