<div align="center">
  <img src="https://github.com/WallyPfister/transcendence/blob/main/img/ping-pong.png" height="128px" alt="Transcendence" >
  <h1>Transcendence</h1>
  <p> Socket based online pong game </p>
</div>
</br>

## 🎬 Preview
![](https://github.com/WallyPfister/transcendence/blob/main/img/in_game.gif?raw=true)
</br></br></br>

## 👩‍💻 Tech Stack
<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"/>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=Socket.io&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white"/>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white"/>
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=white"/>
  <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"/>
</p>
  

## 📝 Notion
<div align="center">
  
|[🍀 sokim](https://pouncing-elbow-0a4.notion.site/Transcendence-954e7670eea04363a9752ae0fa667050)|[:monocle_face: sunghkim](https://jade-drop-dc9.notion.site/Pong-729ab48c17f84f7bbe21dc3299361f09?pvs=4)|[🧸 sojoo & 🔭 yachoi](https://zoovely.notion.site/Transcendence-FE-80a126363b5543b19b39a80a7eef66b5?pvs=4)|[🐿 hyunjcho](https://future-plane-946.notion.site/Transcendence-d9ff7e05c764453383332b6e06f29736?pvs=4)|
|---|---|---|---|
  
</div>
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

## 💫 Features

### singup
![signup](https://github.com/WallyPfister/transcendence/blob/main/img/signup.gif)

- nickname 중복 및 사용 불가 문자 확인
- 최초 가입 시 사용 가능 email 여부 확인
- 프로필 사진 등록
- two-factor 인증 사용 여부 확인

### Login
![flowchart](https://github.com/WallyPfister/transcendence/blob/main/img/flowchart/transcendence-login.drawio.png)

- 42-Oauth API를 통한 1차 인증
- nodemailer를 이용하여 전송한 이메일 코드로 2차 인증
- 로컬 스토리지에 JWT Access Token이 존재하는 경우 바로 로그인
- JWT Access Token이 만료된 경우 Refresh Token을 통해 재발급

### Profile
![my](https://github.com/WallyPfister/transcendence/blob/main/img/my_profile.gif)

- My Profile 버튼을 통해 자신의 profile 확인
- 친구 목록 또는 채팅방 유저 목록에서 원하는 멤버의 profile 확인
- 해당 멤버의 level, score, game history 및 달성 achievement 등 확인

### Game Random Matching
![ladder](https://github.com/WallyPfister/transcendence/blob/main/img/ladder.gif)

- 게임 대기큐를 이용하여 casual 및 ladder 게임 랜덤 매칭

### Game Invite
![invite](https://github.com/WallyPfister/transcendence/blob/main/img/invite.gif)

- 친구 목록 또는 채팅방 유저 목록에서 원하는 멤버 casual 게임 초대
- 초대시 상대방에게 수락 및 거절 메시지 전송

![rejected](https://github.com/WallyPfister/transcendence/blob/main/img/rejected.gif)

- 상대방이 게임 초대 거절 시 초대 거절 안내

### Game
![game](https://github.com/WallyPfister/transcendence/blob/main/img/in_game.gif)

- 실시간 게임 진행 상황 렌더링
- ladder 게임의 경우 결과에 따라 point 부여 및 point에 따른 level 변경
- achivement 달성 시 반영 

### Ranking
![ranking](https://github.com/WallyPfister/transcendence/blob/main/img/ranking.gif)

- 모든 멤버의 실시간 랭킹 순위 확인

### Chat Admin
![admin](https://github.com/WallyPfister/transcendence/blob/main/img/kick.gif)

- 채팅룸 개설자의 경우 `Chief Admin`권한 부여
- `Chief Admin`의 경우 다른 채팅방 멤버에게 Admin 권한을 부여하거나 제거할 수 있음
- `Admin` 권한을 가진 경우 채팅방 멤버를 Ban, Kick, Mute 할 수 있음
- `Ban`: 해당 채팅방 입장 금지, `Kick`: 채팅방 강제 퇴장, `Mute`: 일정 시간 대화 금지
- 일반 `Admin`은 `Chief Admin`에게 권한 박탈 및 기타 기능을 사용할 수 없음

### Friends & BlackList
![others](https://github.com/WallyPfister/transcendence/blob/main/img/other_profile.gif)

- 친구 및 블랙리스트 목록 관리
- 블랙리스트에 추가된 멤버의 메시지는 해당 멤버에게 미전송

### Private Message
![dm](https://github.com/WallyPfister/transcendence/blob/main/img/other_profile.gif)

- 친구로 등록한 멤버에게 private message 전송 가능
- private message의 경우 파란색으로 표기되며 같은 채팅방에 있지 않아도 수신할 수 있음

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

</br>

## 🚀 Contributers
[🐿hyunjcho](https://github.com/highjcho) | [🧸sojoo](https://github.com/zoovely) | [🪐sunghkim](https://github.com/K-SeongHun) | [🍀sokim](https://github.com/S0YKIM) | [🔭yachoi](https://github.com/yangsonchoi)
