# 1.Cloud Compute

#### Tester : OCI(Ubuntu 20.04) : A1.Flx(3Core, 18GB)

#### Deploy : AWS(Ubuntu 20.04) : Large

# 2. Tech

- Nginx
  - SSL(Letsencrypt:Certbot)
  - Front(Vue)
- Docker
  - Back(Spring Boot) 3.2.3
  - DB
    - MongoDB 7.0.5
    - Redis 7.2.4
    - Postgres 12.18
  - Porainer 2.19.4
  - SonarQube 10.4.1
- Jenkins 2.440.1

- AI 1
- AI 2

# 3. Tree

### workspace

```shell
workspace
├── docker
│   ├── back
│   │   ├── Dockerfile
│   │   ├── application-env.properties
│   │   ├── docker-compose.yaml
│   │   └── knpl-0.0.1-SNAPSHOT.jar
│   ├── mongo
│   │   ├── docker-compose.yaml
│   │   ├── mongodb_config(↓)
│   │   └── mongodb_data(↓)
│   ├── portainer
│   │   └── docker-compose.yaml
│   ├── postgresql
│   │   └── postgresql-data
│   │       ├── postgresql(↓)
│   │       └── postgresql_data(↓)
│   ├── redis
│   │   ├── docker-compose.yaml
│   │   └── redis-data
│   │       └── data(↓)
│   └── sonarqube
│       ├── docker-compose.yaml
│       └── sonarqube-data
│           ├── data(↓)
│           ├── extensions(↓)
│           └── logs(↓)
└── front
    └── dist
        ├── assets
        ├── favicon.ico
        └── index.html
```

### NginX

```shell
NginX
├── nginx.conf
├── sites-available
│   └── j10b301.p.ssafy.io
└── sites-enable
    └── j10b301.p.ssafy.io

```

### SSL

```shell
teddysinfratester3.o-r.kr
├── cert1.pem
├── chain1.pem
├── fullchain1.pem
└── privkey1.pem
```

# 4. Files

### 설정한 파일들 들어올 자리

# 5. Logs

#### 4주차
- 2024.03.21
  - Back-end HTTPS(SSL)철회
  - Back-end env 파일 수정
  - Infra 메뉴얼 작성
  - SonarQube 결과 보고서 제공
- 2024.03.20
  - SonarQube Front-end 분석 pipeline 수정 및 정적분석 실시
  - Back-end RestAPI CORS에러 해결
  - Back-end HTTPS(SSL)적용
- 2024.03.19
  - SonarQube Back-end 분석 pipeline 작성 및 정적분석 실시
  - SonarQube Front-end 분석 pipeline 작성
- 2024.03.18
  - SonarQube prefix 설정 및 설치 완료
  - SonarQube Jenkins 연동

---

#### 3주차

- 2024.03.15
  - Jenkins CI/CD 결과 리포트 Mattermost Bot을 이용한 알림 설정
  - SonarQube 설치 및 설정(리버스 프록시)
  - Postgres 설치 및 계정 설정
- 2024.03.14
  - Jenkins 프론트/백 엔드 CI/CD pipeline 작성 완료
  - 인프라 테스트 및 버그 리포트 작성
- 2024.03.13
  - Jenkins GitLab프로젝트 웹훅 설정(Push)
  - Jenkins 백엔드 CI/CD 파이프라인 작성 및 테스트
- 2024.03.12
  - Jenkins 리버스 프록시(서브 도메인)
  - Jenkins Gitlab 플러그인 설치
- 2024.03.11
  - OCI -> EC2 이사 완료
  - Jenkins 설치 및 설정(리버스 프록시)

---

#### 2주차

- 2024.03.07
  - Back(Spring boot)컨테이너 구축 및 설정(리버스 프록시)
- 2024.03.06
  - MongoDB 설치 및 계정 설정
  - Redis 설치 및 계정 설정
- 2024.03.05
  - Portainer 설치 및 설정(리버스 프록시)
  - NginX 리버스 프록시 학습
- 2024.03.04
  - Docker 및 Docker Compose 설치

---

#### 1주차

- 2024.02.26. ~ 2024.02.29
  - 인프라 시스템 아키택처 설계
  - OCI 인스턴스 구축
  - 인바운드 규칙 및 방화벽 설정
  - NginX 설치
  - SSL(Letsencrypt:Certbot) 발급 및 NginX HTTPS 적용
  - Front(Vue)프로젝트 NginX에 마운트(리버스 프록시)
