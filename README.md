<div align="center">
  <img src="https://github.com/S0YKIM/Cub3d/blob/main/img/cube.jpg" height="128px" alt="Transcendence" >
  <h1>Transcendence</h1>
  <p> Socket based online pong game </p>
</div>
</br>

## 🎬 Preview
![](https://github.com/S0YKIM/Cub3d/blob/main/img/simulation.gif?raw=true)
</br></br></br>

## 🚀 Contributers
[🐿hyunjcho](https://github.com/highjcho) | [🧸sojoo](https://github.com/zoovely) | [🪐sunghkim](https://github.com/K-SeongHun) | [🍀sokim](https://github.com/S0YKIM) | [🔭yachoi](https://github.com/yangsonchoi)

</br>

## 🚧 Structure
```
./
├── frontend/
│   ├── public/       # index
│   │   └── img/      # image files
│   └── src/
│       ├── Game/     # game page
│       ├── Login/    # login and auth page
│       ├── Main/     # game queue, chat, friend list
│       ├── Profile/  # user stats and history
│       ├── Rank/     # all users leaderboard
│       ├── Signup/   # signup page
│       ├── Socket/   # handle multi-page socket events
│       ├── Util/     # custom axios
│       └── Verify/   # 2fa code verification
└── backend/
    ├── prisma/       # database
    └── src/
        ├── auth/     # authentication for login
        ├── channel/  # socket based chat
        ├── config/   # environment variables
        ├── game/     # control game queue
        ├── member/   # manange members
        ├── pong/     # draw game canvas
        └── prisma/   # prisma ORM
```

</br>

## ❓ Usage

### 🖐️ Clone
```
$ git clone https://github.com/WallyPfister/transcendence.git
```

### 🖐️ Execute
```
$ make # Run containers in the background mode
```
```
$ make dev  # See what is happening in the containers
```

</br>

## 💫 Functions

### Login
![flowchart](https://github.com/WallyPfister/transcendence/blob/main/img/flowchart/transcendence-login.drawio.png)

</br>

## 🌷 Commit Rules
```[type] : title body #(issue number)```

### Commit Type v1.0 (~23/05/14)
- [FEAT] : 새로운 기능의 추가
- [MODIFY] : 기능 수정
- [FIX] : 버그 수정
- [DOCS] : 문서 수정
- [STYLE] : CSS 변경
- [REFACTOR] : 코드 리팩토링
- [MERGE] : 풀리퀘스트 머지
- [TEST] : 테스트 코드 작성
