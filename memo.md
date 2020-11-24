### How to Typescript build

```
npm install
npm install -g typescript
tsc --build tsconfig.json
```

### パッケージ作成

```
npm install -g vsce
```

### MarketPlace への公開

- publisher

```
vsce ls-publishers
vsce login <publisher>
vsce publish
vsce publish minor
```

### ロジック（メモ）

- 一致か？
  - yes:
    - 何もしない
- 一致だけど配列が違う？
  - yes:
    - 最終項目か
      - yes:
        - [space]**[2 つ前以前にある配列の数だけ"**"を入れる]-\_[value]"\n"
      - no :
        - 何もしない＆完全一致フラグ＝ OFF
- 一致しない（完全一致フラグ＝ OFF）
  - yes :
    - 配列か？
      - yes:
        - 最終項目か
          - yes:
            - [space][2つ前以前にある配列の数だけ"__"を入れる][1 つ前が配列なら"-\_"を入れる][key]:"\n"[space]**[2 つ前以前にある配列の数だけ"**"を入れる]-\_[value]"\n"
          - no :
            - [space][2つ前以前にある配列の数だけ"__"を入れる][1 つ前が配列なら"-\_"を入れる][key]:"\n"
      - no:
        - 最終項目か
          - yes:
            - [space][2つ前以前にある配列の数だけ"__"を入れる][1 つ前が配列なら"-\_"を入れる][key]:\_[value]"\n"
            - no :
              - [space][2つ前以前にある配列の数だけ"__"を入れる][1 つ前が配列なら"-\_"を入れる][key]:"\n"
